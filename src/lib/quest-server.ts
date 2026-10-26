import "server-only";
import { getCompletions, getLessonSteps, streakFrom } from "./repo";
import { listModules } from "./learn";
import { PATH } from "./learn-path";
import { lessonStateFn } from "./lesson-done";
import { buildQuest, type QuestLesson } from "./quest";

/** Every lesson in guided-path order, as quest items with their link. */
export function questLessons(): QuestLesson[] {
  const mods = listModules();
  const byRef = new Map(mods.flatMap((m) => m.lessons.filter((l) => l.ref).map((l) => [l.ref!, { l, m }] as const)));
  return PATH.flatMap((p) => p.refs.flatMap((ref) => {
    const x = byRef.get(ref);
    return x ? [{ ref, title: x.l.title.replace(/^Lesson [\d.]+:\s*/, ""), stage: x.l.stage, href: `/learn/${x.m.slug}#${x.l.id}`, stepId: p.id, stepTitle: p.title }] : [];
  }));
}

export async function questForUser(userId: string) {
  const [comps, steps] = await Promise.all([getCompletions(userId), getLessonSteps(userId)]);
  const stepNs = new Map(listModules().flatMap((m) => m.lessons.filter((l) => l.ref).map((l) => [l.ref!, l.stepNs] as const)));
  const state = lessonStateFn(comps.map((c) => c.taskId), steps);
  return { quest: buildQuest(questLessons(), (ref) => state(ref, stepNs.get(ref)) === "done"), streak: streakFrom(comps) };
}
