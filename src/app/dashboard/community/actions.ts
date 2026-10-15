"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { addWin, decideWin, isModerator, mondayOf } from "@/lib/community";
import { isoDay } from "@/lib/dates";

export async function shareWin(form: FormData) {
  const u = await requireUser("/dashboard/community");
  const text = String(form.get("text") ?? "").replace(/\s+/g, " ").trim().slice(0, 280);
  if (text.length < 5) return;
  const firstName = String(u.name ?? "").trim().split(/\s+/)[0]?.slice(0, 30) ?? "";
  await addWin(u.id, text, firstName, mondayOf(isoDay()));
  revalidatePath("/dashboard/community");
}

export async function moderateWin(form: FormData) {
  const u = await requireUser("/dashboard/community");
  if (!isModerator(u.email)) return;
  const id = String(form.get("id"));
  const status = form.get("status") === "approved" ? "approved" : "rejected";
  await decideWin(id, status);
  revalidatePath("/dashboard/community");
}
