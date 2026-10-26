/**
 * The Attract / Convert / Grow quest: every lesson is a checklist item under one of the three stages,
 * with progress per stage and overall, XP, levels, stage badges and a single "next up". Pure, so it is easy to test.
 * "Start here" (path step 1) is a short warm-up before the three stages. Inside a stage, items keep the guided path order
 * and are grouped by path step, so the timeline reads Warm-up, Attract, Convert, Grow.
 */
import { STAGE_ORDER, type StageId } from "./stages";

/** `section` (optional) puts a lesson in another stage section than its own tag, e.g. Convert basics done before ads sit in Attract. */
export type QuestLesson = { ref: string; title: string; stage: StageId; href: string; stepId: string; stepTitle: string; section?: StageId };
export type QuestItem = QuestLesson & { done: boolean; n: number };
export type QuestGroup = { stepId: string; stepTitle: string; items: QuestItem[] };
export type QuestSection = { id: "warmup" | StageId; items: QuestItem[]; groups: QuestGroup[]; done: number; total: number; pct: number; complete: boolean };
export type Badge = { key: string; title: string; note: string; earned: boolean; section: QuestSection["id"] };
export type Quest = { sections: QuestSection[]; done: number; total: number; pct: number; xp: number; level: number; xpToNext: number; badges: Badge[]; next: QuestItem | null; nextSection: QuestSection | null };

export const XP_PER_LESSON = 10;
export const XP_STAGE_BONUS = 200;
export const XP_PER_LEVEL = 250;
export const WARMUP_STEP = "start-here";
const NAMES: Record<QuestSection["id"], string> = { warmup: "Start here", attract: "Attract", convert: "Convert", grow: "Grow" };

export function buildQuest(lessons: QuestLesson[], isDone: (ref: string) => boolean): Quest {
  const ids: QuestSection["id"][] = ["warmup", ...STAGE_ORDER];
  const items: QuestItem[] = lessons.map((l) => ({ ...l, done: isDone(l.ref), n: 0 }));
  const sections = ids.map((id): QuestSection => {
    const its = items.filter((i) => (id === "warmup" ? i.stepId === WARMUP_STEP : i.stepId !== WARMUP_STEP && (i.section ?? i.stage) === id));
    const groups: QuestGroup[] = [];
    for (const i of its) {
      const g = groups.find((x) => x.stepId === i.stepId);
      if (g) g.items.push(i); else groups.push({ stepId: i.stepId, stepTitle: i.stepTitle, items: [i] });
    }
    const done = its.filter((i) => i.done).length;
    return { id, items: its, groups, done, total: its.length, pct: its.length ? Math.round((done / its.length) * 100) : 0, complete: its.length > 0 && done === its.length };
  });
  let n = 0;
  for (const s of sections) for (const i of s.items) i.n = ++n;
  const done = sections.reduce((a, s) => a + s.done, 0);
  const total = sections.reduce((a, s) => a + s.total, 0);
  const xp = done * XP_PER_LESSON + sections.filter((s) => s.complete).length * XP_STAGE_BONUS;
  const badges = sections.flatMap((s): Badge[] => s.id === "warmup"
    ? [{ key: "warmup-done", section: s.id, title: "Set up", note: "Finished Start here.", earned: s.complete }]
    : [
      { key: `${s.id}-first`, section: s.id, title: `${NAMES[s.id]}: first step`, note: `Ticked your first ${NAMES[s.id]} topic.`, earned: s.done >= 1 },
      { key: `${s.id}-half`, section: s.id, title: `${NAMES[s.id]}: halfway`, note: `Half of ${NAMES[s.id]} done.`, earned: s.total > 0 && s.done * 2 >= s.total },
      { key: `${s.id}-master`, section: s.id, title: `${NAMES[s.id]} master`, note: `Every ${NAMES[s.id]} topic done (+${XP_STAGE_BONUS} XP).`, earned: s.complete },
    ]);
  const nextSection = sections.find((s) => !s.complete && s.total > 0) ?? null;
  const next = nextSection?.items.find((i) => !i.done) ?? null;
  return { sections, done, total, pct: total ? Math.round((done / total) * 100) : 0, xp, level: 1 + Math.floor(xp / XP_PER_LEVEL), xpToNext: XP_PER_LEVEL - (xp % XP_PER_LEVEL), badges, next, nextSection };
}
export const sectionName = (id: QuestSection["id"]) => NAMES[id];
