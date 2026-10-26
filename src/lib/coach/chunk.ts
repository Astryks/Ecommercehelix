/**
 * Splits the Helix-worded lesson library into retrieval chunks. Pure (no server-only), so the embed script and tests can use it.
 * Sources (all Helix wording, in the repo): docs/playbook modules, docs/sops, docs/cards.
 * Optional: COACH_EXTRA_DIR = a folder of further Helix-worded rewrites (.md). Never point it at raw transcripts.
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { stageOfLesson, stageOfModule, type StageId } from "../stages";

export type Chunk = { id: string; source: "playbook" | "sop" | "card" | "extra"; slug: string; lessonRef: string | null; stage: StageId; title: string; href: string; text: string; hash: string };

export const CHUNK_CHARS = 2000; // about 500 tokens
export const OVERLAP_CHARS = 200; // about 50 tokens

const slugify = (t: string) => t.toLowerCase().trim().replace(/<[^>]+>/g, "").replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s/g, "-");

/** Markdown to plain-ish text: drop HTML comments, keep link text, drop images and relative file links. */
export function cleanMd(md: string): string {
  return md
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Split text into ~CHUNK_CHARS pieces on paragraph boundaries with OVERLAP_CHARS overlap. */
export function splitText(text: string, size = CHUNK_CHARS, overlap = OVERLAP_CHARS): string[] {
  if (text.length <= size) return text ? [text] : [];
  const paras = text.split(/\n\n+/);
  const out: string[] = [];
  let cur = "";
  for (const p of paras) {
    const pieces = p.length > size ? p.match(new RegExp(`[\\s\\S]{1,${size}}`, "g"))! : [p];
    for (const piece of pieces) {
      if (cur && cur.length + piece.length + 2 > size) {
        out.push(cur);
        cur = cur.slice(-overlap) + "\n\n" + piece;
      } else cur = cur ? cur + "\n\n" + piece : piece;
    }
  }
  if (cur) out.push(cur);
  return out;
}

const mk = (c: Omit<Chunk, "id" | "hash">, i: number): Chunk => {
  const hash = createHash("sha256").update(c.title + "\n" + c.text).digest("hex").slice(0, 16);
  return { ...c, id: `${c.source}:${c.slug}:${c.lessonRef ?? "x"}:${i}`, hash };
};

export function playbookChunks(root: string): Chunk[] {
  const dir = path.join(root, "docs", "playbook");
  const out: Chunk[] = [];
  for (const f of fs.readdirSync(dir).filter((x) => /^\d\d-.*\.md$/.test(x)).sort()) {
    const md = fs.readFileSync(path.join(dir, f), "utf8");
    const slug = f.replace(/\.md$/, "");
    const num = Number(f.slice(0, 2));
    const modTitle = (md.match(/^# (.+)$/m)?.[1] ?? slug).replace(/^Module \d+:\s*/, "");
    const sections = md.split(/^(?=## )/m);
    sections.forEach((sec, si) => {
      const head = sec.match(/^## (.+)$/m)?.[1];
      const ref = head?.match(/^Lesson (\d+\.\d+):/)?.[1] ?? null;
      const title = head ? `${modTitle}: ${head.replace(/^Lesson \d+\.\d+:\s*/, "")}` : modTitle;
      const href = head ? `/learn/${slug}#${slugify(head)}` : `/learn/${slug}`;
      const stage = ref ? stageOfLesson(ref) : stageOfModule(num);
      splitText(cleanMd(sec)).forEach((text, i) => out.push(mk({ source: "playbook", slug, lessonRef: ref, stage, title, href, text }, si * 100 + i)));
    });
  }
  return out;
}

/** SOPs have no page of their own, so they link to the first module that lists them under Related SOPs. */
export function sopChunks(root: string): Chunk[] {
  const dir = path.join(root, "docs", "sops");
  const pb = path.join(root, "docs", "playbook");
  const modules = fs.readdirSync(pb).filter((x) => /^\d\d-.*\.md$/.test(x)).sort().map((f) => ({ slug: f.replace(/\.md$/, ""), md: fs.readFileSync(path.join(pb, f), "utf8") }));
  const out: Chunk[] = [];
  for (const f of fs.readdirSync(dir).filter((x) => /^\d\d-.*\.md$/.test(x)).sort()) {
    const md = fs.readFileSync(path.join(dir, f), "utf8");
    const slug = f.replace(/\.md$/, "");
    const home = modules.find((m) => m.md.includes(`sops/${f}`));
    const title = (md.match(/^# (.+)$/m)?.[1] ?? slug).replace(/^SOP \d+:\s*/, "") + " (checklist)";
    const num = home ? Number(home.slug.slice(0, 2)) : 1;
    splitText(cleanMd(md)).forEach((text, i) => out.push(mk({ source: "sop", slug, lessonRef: null, stage: stageOfModule(num), title, href: home ? `/learn/${home.slug}` : "/dashboard/learn", text }, i)));
  }
  return out;
}

/** Step cards: one chunk per lesson ref, linked to that lesson. */
export function cardChunks(root: string, lessonHref: (ref: string) => { href: string; title: string } | null): Chunk[] {
  const dir = path.join(root, "docs", "cards");
  const out: Chunk[] = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Record<string, { intro?: string; steps?: { say?: string; check?: string; careful?: string; lost?: string }[] }>;
    for (const [ref, card] of Object.entries(data)) {
      const link = lessonHref(ref);
      if (!link) continue;
      const body = [card.intro ?? "", ...(card.steps ?? []).map((s, i) => [`Step ${i + 1}. ${s.say ?? ""}`, s.check ? `Check: ${s.check}` : "", s.careful ? `Careful: ${s.careful}` : ""].filter(Boolean).join("\n"))].join("\n\n");
      splitText(cleanMd(body)).forEach((text, i) => out.push(mk({ source: "card", slug: f.replace(/\.json$/, ""), lessonRef: ref, stage: stageOfLesson(ref), title: `${link.title} (step by step)`, href: link.href, text }, i)));
    }
  }
  return out;
}

/** Optional extra Helix-worded notes. Each .md must start with a "# Title" and a "Link: /learn/..." line. */
export function extraChunks(dir: string): Chunk[] {
  const out: Chunk[] = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".md")).sort()) {
    const md = fs.readFileSync(path.join(dir, f), "utf8");
    const href = md.match(/^Link:\s*(\/\S+)/m)?.[1];
    if (!href) continue; // no Helix lesson to cite: skip
    const title = md.match(/^# (.+)$/m)?.[1] ?? f;
    splitText(cleanMd(md.replace(/^Link:.*$/m, ""))).forEach((text, i) => out.push(mk({ source: "extra", slug: f.replace(/\.md$/, ""), lessonRef: null, stage: "attract", title, href, text }, i)));
  }
  return out;
}

/** Lesson ref -> link, built from the playbook headings (same rule as src/lib/lesson-links.ts). */
export function lessonIndex(root: string): (ref: string) => { href: string; title: string } | null {
  const m = new Map<string, { href: string; title: string }>();
  for (const c of playbookChunks(root)) if (c.lessonRef && !m.has(c.lessonRef)) m.set(c.lessonRef, { href: c.href, title: c.title });
  return (ref) => m.get(ref) ?? null;
}

export function allChunks(root: string, extraDir?: string): Chunk[] {
  const out = [...playbookChunks(root), ...sopChunks(root), ...cardChunks(root, lessonIndex(root))];
  if (extraDir && fs.existsSync(extraDir)) out.push(...extraChunks(extraDir));
  return out;
}
