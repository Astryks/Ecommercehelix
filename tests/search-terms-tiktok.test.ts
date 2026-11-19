/** Finishing step — Google search-term summariser + TikTok campaign summariser. Pure, no API calls. */
import { describe, expect, it } from "vitest";
import { summariseSearchTerms } from "@/lib/google-ads/config";
import { tiktokCampaignRows } from "@/lib/tiktok/config";

describe("summariseSearchTerms", () => {
  it("aggregates spend per term and sorts biggest first", () => {
    const rows = summariseSearchTerms([
      { searchTermView: { searchTerm: "free shoes" }, metrics: { costMicros: "60000000", conversions: 0 } },
      { searchTermView: { searchTerm: "linen shirt" }, metrics: { costMicros: "12000000", conversions: 2 } },
      { searchTermView: { searchTerm: "free shoes" }, metrics: { costMicros: "40000000", conversions: 0 } },
    ]);
    expect(rows).toEqual([
      { term: "free shoes", spend: 100, conversions: 0 },
      { term: "linen shirt", spend: 12, conversions: 2 },
    ]);
  });
  it("drops blank terms", () => {
    expect(summariseSearchTerms([{ searchTermView: { searchTerm: "  " }, metrics: {} }])).toEqual([]);
  });
});

describe("tiktokCampaignRows", () => {
  it("aggregates spend/impressions/clicks per campaign", () => {
    const rows = tiktokCampaignRows([
      { dimensions: { campaign_id: "c1", campaign_name: "Prospecting" }, metrics: { spend: "10", impressions: "1000", clicks: "20", conversion: "1" } },
      { dimensions: { campaign_id: "c1", campaign_name: "Prospecting" }, metrics: { spend: "5", impressions: "500", clicks: "10", conversion: "0" } },
      { dimensions: { campaign_id: "c2", campaign_name: "Retarget" }, metrics: { spend: "2", impressions: "100", clicks: "5", conversion: "0" } },
    ]);
    expect(rows).toEqual([
      { id: "c1", name: "Prospecting", spend: 15, impressions: 1500, clicks: 30, conversions: 1 },
      { id: "c2", name: "Retarget", spend: 2, impressions: 100, clicks: 5, conversions: 0 },
    ]);
  });
  it("drops rows with no campaign id", () => {
    expect(tiktokCampaignRows([{ dimensions: {}, metrics: { spend: "1" } }])).toEqual([]);
  });
});

/** The TikTokSnapshot migration matches its schema model (same hand-written review as pricing). */
import { readFileSync } from "node:fs";
describe("TikTokSnapshot migration", () => {
  it("creates the table with the schema's columns", () => {
    const schema = readFileSync("prisma/schema.prisma", "utf8");
    const sql = readFileSync("prisma/migrations/20261119183001_tiktok-snapshot/migration.sql", "utf8");
    expect(schema).toContain("model TikTokSnapshot");
    for (const col of ['"userId" TEXT', '"data" TEXT', '"syncedAt" TIMESTAMP(3)']) expect(sql).toContain(col);
    expect(sql).toContain('REFERENCES "User"("id")');
    expect(sql).not.toMatch(/DROP TABLE/i);
  });
});
