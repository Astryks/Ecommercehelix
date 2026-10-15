import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { getAccount } from "@/lib/repo";
import { dailyOn, getPrefs, savePrefs } from "@/lib/email/prefs";

export const metadata = { title: "Email settings" };

const ZONES = ["Australia/Sydney", "Australia/Melbourne", "Australia/Brisbane", "Australia/Adelaide", "Australia/Perth", "Pacific/Auckland", "Asia/Singapore", "Asia/Kolkata", "Asia/Dubai", "Europe/London", "Europe/Berlin", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Toronto"];

async function save(form: FormData) {
  "use server";
  const u = await requireUser("/dashboard/settings/emails");
  const tz = String(form.get("timezone") ?? "");
  await savePrefs(u.id, { dailyTasks: form.get("daily") === "on", events: form.get("events") === "on", winback: form.get("winback") === "on", scorecard: form.get("scorecard") === "on", alerts: form.get("alerts") === "on", ...(ZONES.includes(tz) ? { timezone: tz } : {}) });
  revalidatePath("/dashboard/settings/emails");
}

export default async function EmailSettings({ searchParams }: PageProps<"/dashboard/settings/emails">) {
  const sp = await searchParams;
  const u = await requireUser("/dashboard/settings/emails");
  const [p, acct] = await Promise.all([getPrefs(u.id), getAccount(u.id)]);
  const row = (name: string, label: string, note: string, on: boolean) => (
    <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <input type="checkbox" name={name} defaultChecked={on} className="mt-1 h-4 w-4 accent-[#5A50D6]" />
      <span><span className="block font-semibold text-slate-900">{label}</span><span className="block text-sm text-slate-600">{note}</span></span>
    </label>
  );
  return (
    <div className="mx-auto max-w-2xl space-y-4" data-testid="email-settings">
      <p className="text-sm"><Link href="/dashboard/settings" className="text-cyan-700 hover:underline">Settings</Link> / Emails</p>
      <h1 className="text-3xl font-bold tracking-tight">Emails</h1>
      <p className="text-slate-700">Pick the emails you want. Every one of these has a one-click unsubscribe link too.</p>
      {sp.saved && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">Saved.</p>}
      <form action={save} className="space-y-3">
        {row("daily", "Today's steps, each morning", "Your 5 to 7 small steps for the day, at about 7 AM your time. On by default for paid plans.", dailyOn(p, acct.plan))}
        {row("alerts", "Heads-up alerts", "When cash may get tight, stock needs ordering, or a product loses money. Also shown on Today.", p.alerts)}
        {row("events", "Big sale dates", "A heads-up before dates like Black Friday, Christmas and Mother's Day, with a simple plan.", p.events)}
        {row("scorecard", "Monday scorecard", "Last week's sales and profit in plain words, on Monday morning.", p.scorecard)}
        {row("winback", "News if you leave", "One friendly note two weeks after a paid plan ends.", p.winback)}
        <label className="block rounded-xl border border-slate-200 bg-white p-4">
          <span className="block font-semibold text-slate-900">Your time zone</span>
          <select name="timezone" defaultValue={p.timezone} className="input mt-2 w-full">{ZONES.map((z) => <option key={z} value={z}>{z.replace("_", " ")}</option>)}</select>
        </label>
        <button className="btn-primary">Save</button>
      </form>
      <p className="text-sm text-slate-600"><span className="font-hand text-lg text-[#5A50D6]">Always sent:</span> welcome, payment receipts, payment problems and cancellation emails. They are about your account, so they cannot be switched off.</p>
    </div>
  );
}
