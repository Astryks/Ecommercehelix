-- Additive only. Same result as `prisma db push` for the two new models. Safe to run on prod (creates tables, touches nothing else).
CREATE TABLE IF NOT EXISTS "TikTokConnection" (
  "userId" TEXT PRIMARY KEY REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "advertiserId" TEXT,
  "advertiserIds" TEXT NOT NULL DEFAULT '',
  "tokenEnc" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "lastSyncAt" TIMESTAMP(3),
  "lastSyncError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE IF NOT EXISTS "Ga4Property" (
  "userId" TEXT PRIMARY KEY REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "propertyId" TEXT NOT NULL,
  "lastSyncAt" TIMESTAMP(3),
  "lastSyncError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
