import { requireUser } from "@/lib/session";
import { getAccount, getCompletions } from "@/lib/repo";
import { CountryPicker, TaxPicker, TrackPicker } from "@/components/TrackPicker";
import { TRACKS } from "@/lib/tracks";
import { saveProfileSettings } from "../actions";

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
    </div>
  );
}
