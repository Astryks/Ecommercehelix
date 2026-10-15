import { ExternalLink, Trophy, Users } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getAccount } from "@/lib/repo";
import { PLAN_RANK } from "@/lib/plans";
import { approvedWins, isModerator, mondayOf, myWins, pendingWins } from "@/lib/community";
import { isoDay } from "@/lib/dates";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { LostLink } from "@/components/dashboard/LostLink";
import { moderateWin, shareWin } from "./actions";

export const metadata = { title: "Community" };

export default async function CommunityPage() {
  const u = await requireUser("/dashboard/community");
  const acct = await getAccount(u.id);
  const paid = PLAN_RANK[acct.plan] >= PLAN_RANK.starter;
  const week = mondayOf(isoDay());
  const mod = isModerator(u.email);
  const [wins, mine, pending] = await Promise.all([approvedWins(week), myWins(u.id), mod ? pendingWins() : Promise.resolve([])]);
  const group = process.env.FACEBOOK_GROUP_URL;
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="page-title">Community</h1>
        <p className="page-lead">Store owners growing a little every day, together.</p>
      </header>

      <section className="card p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-hand flex items-center gap-2 text-xl text-cyan-700"><Users className="h-5 w-5" aria-hidden /> Members group</h2>
          <LostLink about="Joining the members group" />
        </div>
        {paid ? (
          group ? (
            <>
              <p className="mt-1 text-sm text-slate-700">A private Facebook group for paying members. Ask questions and share what works.</p>
              <a href={group} target="_blank" rel="noopener noreferrer" className="btn-primary mt-3 text-sm">Open the members group <ExternalLink className="h-4 w-4" aria-hidden /></a>
            </>
          ) : (
            <p className="mt-1 text-sm text-slate-700"><strong>Opening soon.</strong> The private members group is nearly ready. We will email you when it opens.</p>
          )
        ) : (
          <div className="mt-3"><UpgradePrompt need="starter" forKey="community" compact title="Join the members group" body="The private members group is for Starter and Growth members. Upgrade to get the link." /></div>
        )}
      </section>

      <section className="card p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-hand flex items-center gap-2 text-xl text-cyan-700"><Trophy className="h-5 w-5" aria-hidden /> This week&apos;s wins</h2>
          <LostLink about="Sharing a win" />
        </div>
        <p className="mt-1 text-sm text-slate-700">Small wins count. A first sale, a better margin, a new email. Every win is checked by a person before it shows here.</p>
        {wins.length === 0 ? <p className="mt-3 text-sm text-slate-600">No wins up yet this week. Be the first.</p> : (
          <ul className="mt-3 space-y-2">{wins.map((w) => <li key={w.id} className="rounded-lg bg-white p-3 text-sm text-slate-800"><span className="font-semibold">{w.firstName || "A member"}:</span> {w.text}</li>)}</ul>
        )}
        <form action={shareWin} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="win" className="sr-only">Your win</label>
          <input id="win" name="text" required minLength={5} maxLength={280} placeholder="e.g. My first $1,000 week!" className="input" />
          <button className="btn-primary whitespace-nowrap text-sm">Share my win</button>
        </form>
        <p className="mt-1 text-xs text-slate-500">We show your first name only. Please don&apos;t share private details.</p>
        {mine.length > 0 && <p className="mt-2 text-xs text-slate-600">Your recent wins: {mine.map((w) => `"${w.text.slice(0, 40)}" (${w.status === "pending" ? "waiting for a check" : w.status})`).join(" · ")}</p>}
      </section>

      {mod && (
        <section className="card p-5" aria-label="Moderate wins">
          <h2 className="font-hand text-xl text-cyan-700">Wins waiting for a check ({pending.length})</h2>
          <ul className="mt-3 space-y-2">
            {pending.map((w) => (
              <li key={w.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-3 text-sm">
                <span className="flex-1"><strong>{w.firstName || "Member"}</strong> ({w.weekOf}): {w.text}</span>
                <form action={moderateWin}><input type="hidden" name="id" value={w.id} /><input type="hidden" name="status" value="approved" /><button className="btn-primary text-xs">Show it</button></form>
                <form action={moderateWin}><input type="hidden" name="id" value={w.id} /><input type="hidden" name="status" value="rejected" /><button className="btn-ghost text-xs">Hide it</button></form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
