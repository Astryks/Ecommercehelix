"use server";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { deleteAccount } from "@/lib/repo";
import { signOut } from "@/auth";

export async function deleteMyAccount(form: FormData) {
  const u = await requireUser();
  if (String(form.get("confirm") ?? "").trim() !== "DELETE") redirect("/dashboard/settings?delete=confirm#account");
  await deleteAccount(u.id);
  await signOut({ redirectTo: "/?deleted=1" });
}
