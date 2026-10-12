"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { completeTask, getAccount, getCourseState, saveCourseState, setLessonStep, uncompleteTask } from "@/lib/repo";
import { stepKey } from "@/lib/lesson-actions";
import { COURSE_TASK_ID, GOALS, goalTier, toCourseTrack } from "@/lib/course-plan";
import { PLAN_RANK } from "@/lib/plans";

/** Paid goals are enforced here too, not just hidden in the page. */
async function allowedGoal(userId: string, goalId: string) {
  const g = GOALS.find((x) => x.id === goalId);
  if (!g) return false;
  return PLAN_RANK[(await getAccount(userId)).plan] >= PLAN_RANK[goalTier(g)];
}
import { SEASON_TASK_ID } from "@/lib/seasons";
import { BIZ_TASK_ID } from "@/lib/business";

const refresh = () => {
  revalidatePath("/course", "layout");
  revalidatePath("/dashboard", "layout");
};

/** Tick or untick one course task. Lesson-linked tasks also tick the lesson step. */
export async function toggleCourseTask(form: FormData) {
  const u = await requireUser();
  const id = String(form.get("taskId") ?? "");
  const done = form.get("done") === "1";
  if (COURSE_TASK_ID.test(id)) {
    if (!(await allowedGoal(u.id, id.replace(/^course-/, "").replace(/-\d{1,2}-\d{1,2}-s\d{1,2}$/, "")))) return;
    const ref = String(form.get("ref") ?? "");
    const step = Number(form.get("step"));
    if (done) await completeTask(u.id, id);
    else await uncompleteTask(u.id, id);
    if (/^\d{1,2}\.\d{1,2}$/.test(ref) && step > 0) await setLessonStep(u.id, stepKey(ref, step), done);
  } else if (SEASON_TASK_ID.test(id) || BIZ_TASK_ID.test(id)) {
    if (done) await completeTask(u.id, id);
    else await uncompleteTask(u.id, id);
  }
  refresh();
}

/** Switch track (Just starting, Growing, Scaling). Finished goals stay finished. */
export async function setCourseTrack(form: FormData) {
  const u = await requireUser();
  const track = toCourseTrack(form.get("track"));
  const s = (await getCourseState(u.id)) ?? { track, goalId: "", doneGoals: [], confirmed: [], baselineAov: 0, celebrate: null };
  await saveCourseState(u.id, { ...s, track, goalId: "" });
  refresh();
}

/** "I've hit this": for finish lines Helix cannot check from your numbers. */
export async function confirmGoal(form: FormData) {
  const u = await requireUser();
  const id = String(form.get("goalId") ?? "");
  const s = await getCourseState(u.id);
  if (!s || !(await allowedGoal(u.id, id)) || s.confirmed.includes(id)) return;
  await saveCourseState(u.id, { ...s, confirmed: [...s.confirmed, id] });
  refresh();
}

export async function dismissCelebration() {
  const u = await requireUser();
  const s = await getCourseState(u.id);
  if (s?.celebrate) await saveCourseState(u.id, { ...s, celebrate: null });
  refresh();
}
