-- Daily Seminars purchases (additive only). Run once against Neon, or `npm run db:push`.
CREATE TABLE IF NOT EXISTS "SeminarPurchase" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "email" TEXT,
  "seminarId" TEXT NOT NULL,
  "stripeSessionId" TEXT NOT NULL UNIQUE,
  "amountCents" INTEGER NOT NULL,
  "livemode" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "SeminarPurchase_userId_idx" ON "SeminarPurchase" ("userId");
CREATE INDEX IF NOT EXISTS "SeminarPurchase_email_idx" ON "SeminarPurchase" ("email");
