-- Finishing step (19 Nov 2026) — TikTok campaign snapshot.
-- Hand-written like prisma/migrations/20261119183000_pricing-wallet/migration.sql:
-- the sandbox cannot run `prisma migrate dev` (no DB, npm registry
-- unreachable). Additive only: one new table. Still needs
--   npx prisma migrate deploy
-- on a machine with a database.
CREATE TABLE IF NOT EXISTS "TikTokSnapshot" (
  "userId" TEXT PRIMARY KEY REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "data" TEXT NOT NULL,
  "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
