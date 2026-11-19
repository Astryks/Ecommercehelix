/**
 * Finishing step — the Step 4 pricing migration exists and matches the schema.
 *
 * The sandbox cannot run `prisma migrate dev` (no database, npm registry
 * unreachable), so prisma/migrations/20261119183000_pricing-wallet/migration.sql
 * was hand-written from the three models in prisma/schema.prisma. This test
 * is the checked review: it parses the schema models and asserts every
 * field has a matching column in the migration, with the Prisma type mapping
 * (String -> TEXT, Float -> DOUBLE PRECISION, Boolean -> BOOLEAN,
 * DateTime -> TIMESTAMP(3)), plus the foreign key to "User" and the indexes.
 * It does NOT prove the SQL runs against Postgres — that still needs
 * `npx prisma migrate deploy` on a machine with DATABASE_URL.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SCHEMA = readFileSync("prisma/schema.prisma", "utf8");
const SQL = readFileSync("prisma/migrations/20261119183000_pricing-wallet/migration.sql", "utf8");

const MODELS = ["WalletLedger", "CreditBucket", "UsageEvent"] as const;

function modelFields(model: string): { name: string; type: string }[] {
  const m = SCHEMA.match(new RegExp(`model ${model} \\{([\\s\\S]*?)\\n\\}`, "m"));
  if (!m) throw new Error(`model ${model} not found in schema`);
  return [...m[1].matchAll(/^\s+(\w+)\s+(\w+)(\?|\[\])?/gm)]
    .map((x) => ({ name: x[1], type: x[2] }))
    .filter((f) => !["id"].includes(f.name) || true)
    // Relation fields (User) have no column of their own; the FK lives on userId.
    .filter((f) => f.name !== "user");
}

const TYPE_SQL: Record<string, string> = {
  String: "TEXT",
  Float: "DOUBLE PRECISION",
  Boolean: "BOOLEAN",
  DateTime: "TIMESTAMP(3)",
};

describe("pricing migration matches the schema", () => {
  for (const model of MODELS) {
    it(`${model}: table exists`, () => {
      expect(SQL).toContain(`CREATE TABLE IF NOT EXISTS "${model}"`);
    });
    it(`${model}: every scalar field has a column of the right type`, () => {
      for (const f of modelFields(model)) {
        const sqlType = TYPE_SQL[f.type];
        expect(sqlType, `no SQL mapping for ${model}.${f.name} (${f.type})`).toBeDefined();
        expect(SQL).toContain(`"${f.name}" ${sqlType}`);
      }
    });
    it(`${model}: userId references "User" with cascade delete`, () => {
      expect(SQL).toContain(`"userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE`);
    });
  }

  it("indexes match the schema @@index blocks", () => {
    expect(SQL).toContain(`"WalletLedger_userId_createdAt_idx"`);
    expect(SQL).toContain(`"CreditBucket_userId_expiresAt_idx"`);
    expect(SQL).toContain(`"UsageEvent_userId_createdAt_idx"`);
    expect(SQL).toContain(`"UsageEvent_orgId_createdAt_idx"`);
    expect(SQL).toContain(`"UsageEvent_plan_createdAt_idx"`);
  });

  it("is additive only — no ALTER/DROP of existing tables", () => {
    expect(SQL).not.toMatch(/DROP TABLE|ALTER TABLE/i);
  });
});
