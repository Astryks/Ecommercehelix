import { describe, expect, it } from "vitest";
import { buildQuest, XP_PER_LESSON, XP_STAGE_BONUS, type QuestLesson } from "@/lib/quest";
const L = (ref: string, stage: QuestLesson["stage"], stepId = "s"): QuestLesson => ({ ref, title: ref, stage, href: `/x#${ref}`, stepId, stepTitle: stepId });
const lessons = [L("1.1", "grow", "start-here"), L("3.1", "attract"), L("3.2", "attract"), L("13.1", "convert"), L("1.2", "grow")];
describe("quest", () => {
  it("orders Start here, Attract, Convert, Grow and picks next up", () => {
    const q = buildQuest(lessons, () => false);
    expect(q.sections.map((s) => s.id)).toEqual(["warmup", "attract", "convert", "grow"]);
    expect(q.next?.ref).toBe("1.1");
    expect(q.total).toBe(5);
  });
  it("gives XP, stage bonus and badges", () => {
    const done = new Set(["1.1", "3.1", "3.2"]);
    const q = buildQuest(lessons, (r) => done.has(r));
    expect(q.xp).toBe(3 * XP_PER_LESSON + 2 * XP_STAGE_BONUS);
    expect(q.badges.find((b) => b.key === "attract-master")?.earned).toBe(true);
    expect(q.badges.find((b) => b.key === "convert-first")?.earned).toBe(false);
    expect(q.next?.ref).toBe("13.1");
    expect(q.pct).toBe(60);
  });
});
