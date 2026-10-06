import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { Logo } from "@/components/Logo";
import { CountryPicker, TrackPicker } from "@/components/TrackPicker";
import { ensureUser, getAccount } from "@/lib/repo";
import { finishOnboarding } from "./actions";
import { DemoAccountNotice } from "@/components/DemoAccountNotice";
import { isDemoUserId } from "@/lib/demo-auth";

export const dynamic = "force-dynamic";

/** Onboarding: store link, track (Just starting or Growing) and country for the calendar. */
export default async function Start({ searchParams }: PageProps<"/start">) {
  const sp = await searchParams;
  const raw = typeof sp.url === "string" ? sp.url.trim().slice(0, 200) : "";
  const s = await auth();
  if (!s?.user?.id) redirect("/signin?next=" + encodeURIComponent("/start" + (raw ? "?url=" + raw : "")));
  const id = await ensureUser(s.user.id, s.user.email ?? "", s.user.name ?? "");
  const acct = await getAccount(id);
  return (
    <>
    {isDemoUserId(id) && <DemoAccountNotice />}
    <main className="min-h-screen bg-mist px-5 py-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/"><Logo size={30} /></Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Step 1 of 1 · about 1 minute</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Let&apos;s set up your plan</h1>
        <p className="mt-2 max-w-2xl text-slate-600">Three quick answers. Helix uses them to pick your daily lessons and the key sale dates in your calendar.</p>
        <form action={finishOnboarding} className="card mt-6 space-y-8 p-6 sm:p-8">
          <div>
            <label htmlFor="url" className="text-sm font-semibold text-slate-900">Your store link <span className="font-normal text-slate-500">(optional)</span></label>
            <input id="url" name="url" defaultValue={raw || acct.storeUrl || ""} placeholder="yourstore.com" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base focus:border-cyan-500 focus:outline-none" />
            <p className="mt-1 text-xs text-slate-500">No store yet? Leave it blank. You can add it later.</p>
          </div>
          <TrackPicker value={acct.onboarded ? acct.track : undefined} />
          <CountryPicker value={acct.country} />
          <button className="btn-primary px-6 py-3 text-base">Start my plan <ArrowRight className="h-4 w-4" aria-hidden /></button>
        </form>
      </div>
    </main>
    </>
  );
}
