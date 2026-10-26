/** In-memory keyword search over the chunks. Used before the embedding job has run, or if the DB search fails. No cost. */
import type { Chunk } from "./chunk";
import type { Hit } from "./router";
import { approxTokens } from "./router";

const STOP = new Set("a an the and or but if of to in on at for with by from as is are was were be it this that i you my me we our your do does how what why when which can should would will get".split(" "));
export const terms = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));

/**
 * BM25 over chunk text and titles, mapped to 0..1 so the MIN_SCORE threshold means roughly the same thing
 * as the hybrid score: about 0.55+ when most question terms appear in one lesson.
 */
export function keywordSearch(chunks: Chunk[], q: string, k: number): Hit[] {
  const qt = [...new Set(terms(q))];
  if (!qt.length) return [];
  const docs = chunks.map((c) => terms(c.title + " " + c.title + " " + c.text));
  const avg = docs.reduce((a, d) => a + d.length, 0) / Math.max(1, docs.length);
  const df = new Map(qt.map((t) => [t, docs.filter((d) => d.includes(t)).length]));
  const N = docs.length;
  const scored = docs.map((d, i) => {
    let s = 0;
    let matched = 0;
    for (const t of qt) {
      const tf = d.filter((w) => w === t).length;
      if (!tf) continue;
      matched++;
      const idf = Math.log(1 + (N - df.get(t)! + 0.5) / (df.get(t)! + 0.5));
      s += (idf * tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (d.length / avg)));
    }
    return { i, s, cover: matched / qt.length };
  });
  const top = scored.filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, k);
  const max = top[0]?.s ?? 1;
  return top.map((x) => ({ id: chunks[x.i].id, title: chunks[x.i].title, href: chunks[x.i].href, text: chunks[x.i].text, tokens: approxTokens(chunks[x.i].text), score: Math.round((0.75 * x.cover + 0.25 * (x.s / max)) * 1000) / 1000 }));
}
