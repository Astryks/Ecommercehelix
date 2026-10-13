import { LegalLinks } from "@/components/legal/LegalLinks";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { Logo } from "@/components/Logo";
import { CountryPicker } from "@/components/TrackPicker";
import { PendingButton } from "@/components/PendingButton";
import { ensureUser, getAccount, getDiagnosis } from "@/lib/repo";
import { QUESTIONS } from "@/lib/diagnosis";
import { saveQuestions, saveStoreStep } from "./actions";
import { DemoAccountNotice } from "@/components/DemoAccountNotice";
import { isDemoUserId } from "@/lib/demo-auth";

export const dynamic = "force-dynamic";

/** Onboarding wizard: 1) store and country, 2) ten quick questions, 3) your plan (/start/plan). */
export default async function Start({ searchParams }: PageProps<"/start">) {
  const sp = await searchParams;
  const raw = typeof sp.url === "string" ? sp.url.trim().slice(0, 200) : "";
  const step = sp.step === "2" ? 2 : 1;
  const s = await auth();
  if (!s?.user?.id) redirect("/signin?next=" + encodeURIComponent("/start" + (raw ? "?url=" + raw : "")));
  const id = await ensureUser(s.user.id, s.user.email ?? "", s.user.name ?? "");
  const [acct, diag] = await Promise.all([getAccount(id), getDiagnosis(id)]);
  const prev = diag?.diagnosis.answers ?? {};
  return (
    <>
      {isDemoUserId(id) && <DemoAccountNotice />}
      <main className="min-h-screen bg-mist px-5 py-10">
        <div className="mx-auto max-w-3xl">
          <Link href="/"><Logo size={30} /></Link>
          <ol className="mt-8 flex gap-2 text-xs font-semibold" aria-label="Steps">
            {["Your store", "10 quick questions", "Your plan"].map((t, i) => (
              <li key={t} className={`rounded-full px-3 py-1 ${i + 1 === step ? "bg-slate-900 text-white" : i + 1 < step ? "bg-cyan-100 text-cyan-900" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}>{i + 1}. {t}</li>
            ))}
          </ol>
          {step === 1 ? (
            <>
              <h1 className="mt-4 text-3xl font-bold tracking-tight">Let&apos;s build your plan</h1>
              <p className="mt-2 text-slate-600">About 2 minutes. Then Helix checks your store and shows you what to do first.</p>
              <form action={saveStoreStep} className="card mt-6 space-y-8 p-6 sm:p-8">
                <div>
                  <label htmlFor="url" className="text-sm font-semibold text-slate-900">Your store link</label>
                  <input id="url" name="url" defaultValue={raw || acct.storeUrl || ""} placeholder="yourstore.com" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base focus:border-cyan-500 focus:outline-none" />
                  {sp.bad === "url" ? <p className="mt-1 text-sm text-rose-700">That doesn&apos;t look like a public web address. Try something like yourstore.com.</p> : <p className="mt-1 text-xs text-slate-500">We read your home page and one product page to find your top fixes. No store yet? Leave it blank.</p>}
                </div>
                <CountryPicker value={acct.country} />
                <button className="btn-primary px-6 py-3 text-base">Next <ArrowRight className="h-4 w-4" aria-hidden /></button>
              </form>
            </>
          ) : (
            <>
              <h1 className="mt-4 text-3xl font-bold tracking-tight">10 quick questions</h1>
              <p className="mt-2 text-slate-600">Tap the closest answer. &quot;Not sure&quot; is always fine. We use this to find the one thing holding you back.</p>
              <form action={saveQuestions} className="card mt-6 space-y-7 p-6 sm:p-8">
                {diag && <input type="hidden" name="restart" value={sp.restart === "1" ? "1" : "0"} />}
                {QUESTIONS.map((q, n) => (
                  <fieldset key={q.id}>
                    <legend className="text-sm font-semibold text-slate-900">{n + 1}. {q.q}</legend>
                    {q.help && <p className="mt-0.5 text-xs text-slate-500">{q.help}</p>}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {q.options.map((o) => (
                        <label key={o.v} className="cursor-pointer rounded-xl border-2 border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 has-[:checked]:border-cyan-500 has-[:checked]:bg-cyan-50 has-[:checked]:text-slate-900">
                          <input type="radio" name={q.id} value={o.v} defaultChecked={prev[q.id] === o.v} required className="sr-only" />{o.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
                <div className="flex items-center gap-4">
                  <Link href="/start" className="btn-ghost">Back</Link>
                  <PendingButton pending={acct.storeUrl ? "Checking your store…" : "Building your plan…"}>Show my plan <ArrowRight className="h-4 w-4" aria-hidden /></PendingButton>
                </div>
              </form>
            </>
          )}
        </div>
        <LegalLinks className="mt-10 block text-center text-xs text-slate-500" />
      </main>
    </>
  );
}
