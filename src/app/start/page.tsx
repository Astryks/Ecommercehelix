import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureUser, setStore } from "@/lib/repo";

export default async function Start({ searchParams }: PageProps<"/start">) {
  const sp = await searchParams;
  const raw = typeof sp.url === "string" ? sp.url.trim().slice(0, 200) : "";
  const s = await auth();
  if (!s?.user?.id) redirect("/signin?next=" + encodeURIComponent("/start?url=" + raw));
  if (raw) {
    const url = /^https?:\/\//.test(raw) ? raw : "https://" + raw;
    const id = await ensureUser(s.user.id, s.user.email ?? "", s.user.name ?? "");
    await setStore(id, url);
  }
  redirect("/dashboard?welcome=1");
}
