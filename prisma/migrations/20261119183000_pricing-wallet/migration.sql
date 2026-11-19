-- Step 4 — Pricing wallet + weekly-expiring credits (finishing step, 19 Nov 2026).
-- Hand-written: the sandbox cannot run `prisma migrate dev` (no DB, npm
-- registry unreachable), so this SQL was written from the three models in
-- prisma/schema.prisma (WalletLedger, CreditBucket, UsageEvent) and checked
-- by tests/pricing-migration.test.ts, which asserts every model field has a
-- matching column with the right Prisma type mapping.
-- Additive only: three new tables, no existing table altered or dropped.
-- Still needs, on a machine with a database:
--   npx prisma migrate deploy
-- (or `npx prisma migrate dev --name pricing-wallet` to regenerate it from
-- the schema and diff against this file first.)

CREATE TABLE IF NOT EXISTS "WalletLedger" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "type" TEXT NOT NULL,
  "amountUsd" DOUBLE PRECISION NOT NULL,
  "credits" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "ref" TEXT,
  "demo" BOOLEAN NOT NULL DEFAULT false,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "WalletLedger_userId_createdAt_idx" ON "WalletLedger"("userId", "createdAt");

CREATE TABLE IF NOT EXISTS "CreditBucket" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "kind" TEXT NOT NULL,
  "credits" DOUBLE PRECISION NOT NULL,
  "remaining" DOUBLE PRECISION NOT NULL,
  "grace" BOOLEAN NOT NULL DEFAULT false,
  "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "CreditBucket_userId_expiresAt_idx" ON "CreditBucket"("userId", "expiresAt");

CREATE TABLE IF NOT EXISTS "UsageEvent" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "orgId" TEXT NOT NULL,
  "plan" TEXT NOT NULL,
  "feature" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "credits" DOUBLE PRECISION NOT NULL,
  "providerUsd" DOUBLE PRECISION NOT NULL,
  "billedUsd" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "UsageEvent_userId_createdAt_idx" ON "UsageEvent"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "UsageEvent_orgId_createdAt_idx" ON "UsageEvent"("orgId", "createdAt");
CREATE INDEX IF NOT EXISTS "UsageEvent_plan_createdAt_idx" ON "UsageEvent"("plan", "createdAt");
