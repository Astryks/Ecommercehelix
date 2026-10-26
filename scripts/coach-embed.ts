/**
 * Helix coach: chunk + embed the Helix-worded course corpus into "CoachChunk".
 *
 *   npx vite-node scripts/coach-embed.ts            # DRY RUN (default): counts chunks, tokens and exact cost. No network, no spend.
 *   npx vite-node scripts/coach-embed.ts --yes      # REAL RUN: needs DATABASE_URL + AI_GATEWAY_API_KEY. Spends money (see dry run).
 *
 * Env: COACH_EXTRA_DIR=/path/to/helix-worded-md (optional, Helix-reworded files only, each with a "Link: /learn/..." line).
 * Never point COACH_EXTRA_DIR at raw transcripts. Only changed chunks (by hash) are re-embedded; removed chunks are deleted.
 */
import path from "node:path";
import { allChunks, type Chunk } from "../src/lib/coach/chunk";
import { COACH_MODELS, COACH_PRICES, EMBED_DIMS } from "../src/lib/coach/config";

const root = path.resolve(__dirname, "..");
const yes = process.argv.includes("--yes");
const BATCH = 64;

const approxTokens = (s: string) => Math.ceil(s.length / 4);

/** Prisma over TCP by default; COACH_DB_HTTP=1 uses the Neon HTTPS driver (for machines where port 5432 is blocked). Same tagged-template API. */
type Db = { $queryRaw<T>(s: TemplateStringsArray, ...v: unknown[]): Promise<T>; $executeRaw(s: TemplateStringsArray, ...v: unknown[]): Promise<unknown>; $disconnect(): Promise<void> };
async function openDb(): Promise<Db> {
  if (process.env.COACH_DB_HTTP === "1") {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!);
    return { $queryRaw: (s, ...v) => sql(s, ...v) as never, $executeRaw: (s, ...v) => sql(s, ...v), $disconnect: async () => {} };
  }
  const { PrismaClient } = await import("@prisma/client");
  return new PrismaClient() as unknown as Db;
}

async function main() {
  const chunks = allChunks(root, process.env.COACH_EXTRA_DIR);
  const tokens = chunks.reduce((n, c) => n + approxTokens(c.title + "\n" + c.text), 0);
  const perM = COACH_PRICES[COACH_MODELS.embed]?.[0] ?? 0.2;
  const by = chunks.reduce<Record<string, number>>((m, c) => ((m[c.source] = (m[c.source] ?? 0) + 1), m), {});
  console.log(`Helix coach corpus: ${chunks.length} chunks (${Object.entries(by).map(([k, v]) => `${k} ${v}`).join(", ")})`);
  console.log(`~${tokens.toLocaleString()} tokens with ${COACH_MODELS.embed} at $${perM}/1M → full embed ≈ $${((tokens / 1e6) * perM).toFixed(4)} (one-off; re-runs only pay for changed chunks)`);
  console.log(`Query-time embeddings: ~30 tokens each ≈ $${((30 / 1e6) * perM).toFixed(6)} per question.`);
  if (!yes) return console.log("\nDry run only. Nothing was sent. Re-run with --yes to embed (this spends money).");

  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) throw new Error("AI_GATEWAY_API_KEY is not set");
  const { embedMany } = await import("ai");
  const db = await openDb();
  try {
    const have = new Map((await db.$queryRaw<{ id: string; hash: string; e: boolean }[]>`SELECT "id","hash",("embedding" IS NOT NULL) AS e FROM "CoachChunk"`).map((r) => [r.id, r]));
    const todo: Chunk[] = chunks.filter((c) => { const h = have.get(c.id); return !h || h.hash !== c.hash || !h.e; });
    const keep = new Set(chunks.map((c) => c.id));
    const gone = [...have.keys()].filter((id) => !keep.has(id));
    const todoTok = todo.reduce((n, c) => n + approxTokens(c.title + "\n" + c.text), 0);
    console.log(`To embed: ${todo.length} chunks (~${todoTok} tokens ≈ $${((todoTok / 1e6) * perM).toFixed(4)}); to delete: ${gone.length}`);
    if (gone.length) await db.$executeRaw`DELETE FROM "CoachChunk" WHERE "id" = ANY(${gone})`;
    let spent = 0;
    for (let i = 0; i < todo.length; i += BATCH) {
      const batch = todo.slice(i, i + BATCH);
      const r = await embedMany({
        model: COACH_MODELS.embed,
        values: batch.map((c) => `${c.title}\n${c.text}`),
        providerOptions: { google: { outputDimensionality: EMBED_DIMS, taskType: "RETRIEVAL_DOCUMENT" }, gateway: { tags: ["feature:coach-embed"] } },
      });
      spent += ((r.usage?.tokens ?? 0) / 1e6) * perM;
      for (let j = 0; j < batch.length; j++) {
        const c = batch[j];
        const v = `[${r.embeddings[j].join(",")}]`;
        await db.$executeRaw`
          INSERT INTO "CoachChunk" ("id","source","slug","lessonRef","stage","title","href","text","hash","tokens","embedding","tsv","updatedAt")
          VALUES (${c.id},${c.source},${c.slug},${c.lessonRef},${c.stage},${c.title},${c.href},${c.text},${c.hash},${approxTokens(c.text)},${v}::vector,to_tsvector('english', ${c.title + " " + c.text}),now())
          ON CONFLICT ("id") DO UPDATE SET "source"=EXCLUDED."source","slug"=EXCLUDED."slug","lessonRef"=EXCLUDED."lessonRef","stage"=EXCLUDED."stage","title"=EXCLUDED."title","href"=EXCLUDED."href","text"=EXCLUDED."text","hash"=EXCLUDED."hash","tokens"=EXCLUDED."tokens","embedding"=EXCLUDED."embedding","tsv"=EXCLUDED."tsv","updatedAt"=now()`;
      }
      console.log(`  ${Math.min(i + BATCH, todo.length)}/${todo.length} embedded (≈ $${spent.toFixed(4)} so far)`);
    }
    console.log(`Done. Spent ≈ $${spent.toFixed(4)}.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
