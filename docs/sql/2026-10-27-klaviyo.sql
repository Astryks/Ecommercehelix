-- Additive only (Klaviyo, behind KLAVIYO=1). Creates two tables, touches nothing else.
-- CreateTable
CREATE TABLE IF NOT EXISTS "KlaviyoConnection" (
    "userId" TEXT NOT NULL,
    "keyEnc" TEXT NOT NULL,
    "keyHint" TEXT NOT NULL DEFAULT '',
    "accountName" TEXT NOT NULL DEFAULT '',
    "orderMetricId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "summary" JSONB,
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KlaviyoConnection_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "KlaviyoDay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "emailRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "flowRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "campaignRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "flowSends" INTEGER NOT NULL DEFAULT 0,
    "campaignSends" INTEGER NOT NULL DEFAULT 0,
    "opens" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "listSize" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "KlaviyoDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "KlaviyoDay_userId_date_key" ON "KlaviyoDay"("userId", "date");

-- AddForeignKey
ALTER TABLE "KlaviyoConnection" ADD CONSTRAINT "KlaviyoConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KlaviyoDay" ADD CONSTRAINT "KlaviyoDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

