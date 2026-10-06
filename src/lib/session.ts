import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureUser } from "./repo";

/** Returns the canonical user id or redirects to sign-in. */
export async function requireUser(next = "/dashboard") {
  const s = await auth();
  if (!s?.user?.id) redirect("/signin?next=" + encodeURIComponent(next));
  const id = await ensureUser(s.user.id, s.user.email ?? "", s.user.name ?? "");
  return { id, email: s.user.email ?? "", name: s.user.name ?? "" };
}
