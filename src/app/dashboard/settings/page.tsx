import { requireUser } from "@/lib/session";
import { getAccount, getCompletions } from "@/lib/repo";
import { CountryPicker, TaxPicker, TrackPicker } from "@/components/TrackPicker";
import { TRACKS } from "@/lib/tracks";
import { saveProfileSettings } from "../actions";
import { deleteMyAccount } from "./account-actions";

export default async function Settings({ searchParams }: PageProps<"/dashboard/settings">) {
  const sp = await searchParams;
  const u = await requireUser();
  const [acct, comps] = await Promise.all([getAccount(u.id), getCompletions(u.id)]);
  const done = new Set(comps.map((c) => c.taskId));
  const progress = (["starting", "growing"] as const).map((id) => {
    const t = TRACKS[id];
    return `${t.name}: ${t.days.filter((d) => done.has(t.taskId(d.day))).length} of ${t.days.length} days done`;
  });
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-slate-600">Change your track, country and how Helix treats GST/VAT. Your progress on each track is kept: {progress.join(" · ")}.</p>
      {sp.saved && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Saved. Today and your calendar now follow these settings.</p>}
      <form action={saveProfileSettings} className="card mt-6 space-y-8 p-6 sm:p-8">
        <TrackPicker value={acct.track} />
        <CountryPicker value={acct.country} />
        <TaxPicker value={acct.salesTaxMode} country={acct.country} />
        <button className="btn-primary px-6 py-2.5">Save settings</button>
      </form>
      <section id="account" className="card mt-6 space-y-6 p-6 sm:p-8">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#0B1F3A]">Your data</h2>
          <p className="mt-1 text-sm text-slate-600">Download everything Helix stores about you as one file: your numbers, tasks, lessons, plans and settings. Connection passwords and tokens are never included.</p>
          <a href="/api/account/export" className="btn-ghost mt-3 inline-block px-5 py-2">Download my data</a>
        </div>
        <div className="border-t border-slate-200 pt-6">
          <h2 className="font-display text-xl font-semibold text-rose-800">Delete my account</h2>
          <p className="mt-1 text-sm text-slate-600">This permanently deletes your account and everything in it. It cannot be undone. If you pay for a plan, cancel it under Billing first. Type DELETE to confirm.</p>
          {sp.delete === "confirm" && <p className="mt-2 text-sm text-rose-700">Please type DELETE in capitals to confirm.</p>}
          <form action={deleteMyAccount} className="mt-3 flex flex-wrap gap-2">
            <input name="confirm" aria-label="Type DELETE to confirm" placeholder="DELETE" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" autoComplete="off" />
            <button className="rounded-lg bg-rose-700 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-800">Delete my account</button>
          </form>
        </div>
      </section>
    </div>
  );
}
