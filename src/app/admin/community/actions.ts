"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { isGroupAdmin } from "@/lib/fb-group/admin";
import { addGroupEvent, groupPeople } from "@/lib/fb-group/store";

/** Mark one or more people done: approved into the group, or removed from it. */
export async function markDone(form: FormData) {
  const u = await requireUser("/admin/community");
  if (!isGroupAdmin(u.email)) return;
  const one = String(form.get("one") ?? "");
  const ids = new Set(one ? [one] : form.getAll("id").map(String).filter(Boolean).slice(0, 200));
  if (!ids.size) return;
  for (const p of await groupPeople()) {
    if (!ids.has(p.userId)) continue;
    if (p.status === "approve") await addGroupEvent(p.userId, "approved", "owner");
    else if (p.status === "remove") await addGroupEvent(p.userId, "removed", "owner");
  }
  revalidatePath("/admin/community");
}
