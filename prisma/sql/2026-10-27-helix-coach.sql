-- Helix AI coach: additive only (new extension, two new tables, indexes). Nothing existing is altered or dropped.
-- Same result as `npx prisma db push` with the current schema; this file also adds the two search indexes Prisma cannot express.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS "CoachChunk" (
  "id" TEXT PRIMARY KEY,
  "source" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "lessonRef" TEXT,
  "stage" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "href" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "hash" TEXT NOT NULL,
  "tokens" INTEGER NOT NULL DEFAULT 0,
  "embedding" vector(768),
  "tsv" tsvector,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "CoachChunk_slug_idx" ON "CoachChunk"("slug");

CREATE TABLE IF NOT EXISTS "CoachUsage" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "tier" TEXT NOT NULL,
  "mode" TEXT NOT NULL,
  "why" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "inputTokens" INTEGER NOT NULL DEFAULT 0,
  "cachedTokens" INTEGER NOT NULL DEFAULT 0,
  "outputTokens" INTEGER NOT NULL DEFAULT 0,
  "costUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "topScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "ok" BOOLEAN NOT NULL DEFAULT true,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "CoachUsage_userId_createdAt_idx" ON "CoachUsage"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "CoachUsage_createdAt_idx" ON "CoachUsage"("createdAt");

CREATE TABLE IF NOT EXISTS "CoachMemory" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "kind" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "fact" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'chat',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "CoachMemory_userId_kind_key_key" ON "CoachMemory"("userId", "kind", "key");
CREATE INDEX IF NOT EXISTS "CoachMemory_userId_idx" ON "CoachMemory"("userId");

CREATE TABLE IF NOT EXISTS "CoachMessage" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "day" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "meta" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "CoachMessage_userId_day_idx" ON "CoachMessage"("userId", "day");

CREATE TABLE IF NOT EXISTS "CoachTask" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "day" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "href" TEXT NOT NULL,
  "why" TEXT NOT NULL DEFAULT '',
  "doneAt" TIMESTAMP(3)
);
CREATE UNIQUE INDEX IF NOT EXISTS "CoachTask_userId_day_key_key" ON "CoachTask"("userId", "day", "key");
CREATE INDEX IF NOT EXISTS "CoachTask_userId_day_idx" ON "CoachTask"("userId", "day");

-- Optional speed-ups (exact scan is fine at this size; add if the table grows past ~50k rows):
-- CREATE INDEX IF NOT EXISTS coach_chunk_hnsw ON "CoachChunk" USING hnsw ("embedding" vector_cosine_ops);
-- CREATE INDEX IF NOT EXISTS coach_chunk_tsv ON "CoachChunk" USING gin ("tsv");
