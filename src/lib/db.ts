import { PrismaClient } from "@prisma/client";

export const hasDb = Boolean(process.env.DATABASE_URL);

const g = globalThis as unknown as { __helixPrisma?: PrismaClient };

export const prisma: PrismaClient =
  g.__helixPrisma ?? new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") g.__helixPrisma = prisma;
