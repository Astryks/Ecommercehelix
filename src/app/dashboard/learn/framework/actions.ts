"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { completeTask, uncompleteTask } from "@/lib/repo";
import { lessonTaskId } from "@/lib/lesson-actions";

/** Tick or untick one topic on the Attract / Convert / Grow checklist (saved as the lesson's task completion). */
export async function toggleTopic(form: FormData) {
  const u = await requireUser();
  const ref = String(form.get("ref") ?? "");
  if (!/^\d{1,2}\.\d{1,2}$/.test(ref)) return;
  if (form.get("done") === "1") await completeTask(u.id, lessonTaskId(ref)); else await uncompleteTask(u.id, lessonTaskId(ref));
  revalidatePath("/dashboard", "layout");
}
