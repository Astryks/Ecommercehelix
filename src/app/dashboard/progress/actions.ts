"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { saveSelfLevel } from "@/lib/journey-server";

/** "Where are you now?" picker on the Road to $100M (used only when there are no real numbers yet). */
export async function setRoadLevel(form: FormData) {
  const u = await requireUser("/dashboard/progress");
  const n = Number(form.get("level"));
  await saveSelfLevel(u.id, Number.isFinite(n) && n > 0 ? n : null);
  revalidatePath("/dashboard/progress");
  revalidatePath("/dashboard");
}
