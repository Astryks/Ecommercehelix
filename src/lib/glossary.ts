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
