import data from "./seed/glossary.json";

export type Term = { term: string; aka: string[]; means: string };
export const GLOSSARY = data as Term[];

/** Aliases too common to match on their own (they are still listed in the glossary). */
const SKIP = new Set(["sales", "gross sales", "cold", "warm", "hot", "broad", "feed", "learning", "threshold", "automation", "contribution", "CR", "upsell", "campaigns", "flows", "creatives", "hooks", "angles", "segments", "bundles", "creators"]);

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const MATCHERS = GLOSSARY.map((t) => {
  const names = [t.term, ...t.aka].filter((n) => !SKIP.has(n));
  const parts = names.map((n) => (/^[A-Z+]{2,}/.test(n) ? escape(n) : escape(n)));
  // Acronyms match case-sensitively; words match case-insensitively.
  const acr = names.filter((n) => /^[A-Z][A-Z+]+s?$/.test(n));
  const words = names.filter((n) => !/^[A-Z][A-Z+]+s?$/.test(n));
  return {
    t,
    re: [
      acr.length ? new RegExp(`(^|[^A-Za-z])(${acr.map(escape).join("|")})(?![A-Za-z])`) : null,
      words.length ? new RegExp(`(^|[^A-Za-z])(${words.map(escape).join("|")})(?![A-Za-z])`, "i") : null,
    ].filter(Boolean) as RegExp[],
    parts,
  };
});

/** Glossary terms that appear in the text, in order of first appearance. */
export function termsIn(text: string, max = 8): Term[] {
  const hits: { t: Term; at: number }[] = [];
  for (const m of MATCHERS) {
    let at = Infinity;
    for (const re of m.re) {
      const r = re.exec(text);
      if (r) at = Math.min(at, r.index + r[1].length);
    }
    if (at !== Infinity) hits.push({ t: m.t, at });
  }
  return hits.sort((a, b) => a.at - b.at).slice(0, max).map((h) => h.t);
}

const escHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const SKIP_TAGS = /^<\/?(a|code|pre|h[1-6]|span|abbr|button|summary)\b/i;

/**
 * Wrap the first use of each glossary term in rendered HTML with a tooltip span
 * (shown on hover and keyboard focus by CSS in globals.css). `seen` carries the
 * terms already explained, so each term gets one tooltip per lesson.
 */
export function glossify(html: string, seen: Set<string> = new Set()): string {
  const parts = html.split(/(<[^>]+>)/);
  let skip = 0;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!p) continue;
    if (p.startsWith("<")) {
      if (SKIP_TAGS.test(p) && !p.endsWith("/>")) skip += p.startsWith("</") ? -1 : 1;
      if (skip < 0) skip = 0;
      continue;
    }
    if (skip > 0) continue;
    let text = p;
    let out = "";
    for (;;) {
      let best: { at: number; len: number; t: Term } | null = null;
      for (const m of MATCHERS) {
        if (seen.has(m.t.term)) continue;
        for (const re of m.re) {
          const r = re.exec(text);
          if (!r) continue;
          const at = r.index + r[1].length;
          if (!best || at < best.at) best = { at, len: r[2].length, t: m.t };
        }
      }
      if (!best) break;
      seen.add(best.t.term);
      const word = text.slice(best.at, best.at + best.len);
      out += text.slice(0, best.at) + `<span class="gloss" tabindex="0" data-tip="${escHtml(`${best.t.term}: ${best.t.means}`)}">${word}</span>`;
      text = text.slice(best.at + best.len);
    }
    parts[i] = out + text;
  }
  return parts.join("");
}
