import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import map from "@/lib/stage-map.json";
import { STAGE_INFO, STAGE_ORDER, TAGGED_MODULES, stageOfLesson, stageOfModule } from "@/lib/stages";
import { DAYS, START_DAYS } from "@/lib/seed/curriculum";

const PB = path.join(process.cwd(), "docs", "playbook");
const files = fs.readdirSync(PB).filter((f) => /^\d\d-.*\.md$/.test(f)).sort();

describe("Attract, Convert, Grow", () => {
  it("names the three stages exactly", () => {
    expect(STAGE_ORDER.map((s) => STAGE_INFO[s].name).join(", ")).toBe("Attract, Convert, Grow");
  });
  it("tags every module, and each stage has modules", () => {
    expect(TAGGED_MODULES).toEqual(files.map((f) => Number(f.slice(0, 2))));
    for (const s of STAGE_ORDER) expect(TAGGED_MODULES.some((n) => stageOfModule(n) === s)).toBe(true);
    expect(stageOfModule(7)).toBe("attract");
    expect(stageOfModule(9)).toBe("convert");
    expect(stageOfModule(26)).toBe("grow");
  });
  it("lesson overrides point at real lessons and differ from their module", () => {
    const all = files.map((f) => fs.readFileSync(path.join(PB, f), "utf8")).join("\n");
    for (const [ref, st] of Object.entries(map.lessons)) {
      expect(all.includes(`## Lesson ${ref}:`), ref).toBe(true);
      expect(st, ref).not.toBe(stageOfModule(Number(ref.split(".")[0])));
    }
    expect(stageOfLesson("7.10")).toBe("grow");
    expect(stageOfLesson("7.4")).toBe("attract");
  });
  it("every lesson in the docs carries its stage tag", () => {
    for (const f of files) {
      const md = fs.readFileSync(path.join(PB, f), "utf8");
      for (const m of md.matchAll(/^## Lesson (\d+\.\d+):.*\n<!-- stage:([a-z]+) -->/gm)) expect(m[2], m[1]).toBe(stageOfLesson(m[1]));
      expect(md.match(/^## Lesson /gm)?.length).toBe([...md.matchAll(/^## Lesson .*\n<!-- stage:/gm)].length);
    }
  });
  it("every daily lesson in both tracks has a stage, and all three appear", () => {
    const seen = new Set([...DAYS, ...START_DAYS].map((d) => stageOfLesson(d.learn.ref)));
    expect([...seen].sort()).toEqual(["attract", "convert", "grow"]);
  });
});
