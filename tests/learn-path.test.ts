import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIRST_AD_BEFORE, PATH } from "@/lib/learn-path";

const PB = path.join(process.cwd(), "docs", "playbook");
const refs = fs.readdirSync(PB).filter((f) => /^\d\d-.*\.md$/.test(f)).sort()
  .flatMap((f) => [...fs.readFileSync(path.join(PB, f), "utf8").matchAll(/^## Lesson (\d+\.\d+):/gm)].map((m) => m[1]));

describe("guided Learn path", () => {
  it("has every lesson exactly once (nothing lost)", () => {
    const inPath = PATH.flatMap((p) => p.refs);
    expect(new Set(inPath).size).toBe(inPath.length);
    expect([...inPath].sort()).toEqual([...refs].sort());
  });
  it("starts with Start here and has the first-ad step with prerequisites", () => {
    expect(PATH[0].title).toBe("Start here");
    expect(PATH.find((p) => p.id === "first-ad")).toBeTruthy();
    expect(FIRST_AD_BEFORE.length).toBeGreaterThan(2);
  });
  it("gives each step 1 or 2 YouTube videos", () => {
    for (const p of PATH) {
      expect(p.videos.length).toBeGreaterThanOrEqual(1);
      expect(p.videos.length).toBeLessThanOrEqual(2);
      for (const v of p.videos) expect(v.url).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/);
    }
  });
});
