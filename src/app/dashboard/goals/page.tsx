import Link from "next/link";
import { BookOpen, Target } from "lucide-react";
import { requireUser } from "@/lib/session";
import { goalsFor } from "@/lib/goals-server";
import { fmtGoal } from "@/lib/goals";
import { GoalsLadder, VanityNote } from "@/components/GoalsLadder";
import { GoalsFields } from "@/components/GoalsFields";
import { saveGoalsAction } from "./actions";

export default async function GoalsPage({ searchParams }: PageProps<"/dashboard/goals">) {
  const sp = await searchParams;
  const u = await requireUser();
  const g = await goalsFor(u.id);
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight"><Target className="h-7 w-7 text-cyan-600" aria-hidden /> Monthly goals</h1>
      <p className="mt-1 max-w-3xl text-slate-600">The numbers to aim at each month, in the order a customer meets them: from a visit to a sale, down to the money you keep. Each one is checked against your last 30 days. <Link href="/learn/goals" className="inline-flex items-center gap-1 text-cyan-700 underline"><BookOpen className="h-4 w-4" aria-hidden /> What each number means</Link></p>
      {sp.saved && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Goals saved. Today and the Dashboard now track these.</p>}
      {g.isDefault && <p className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">These are Helix&apos;s suggested starting goals for your track. Change them below to make them yours.</p>}
      {g.exampleDays > 0 && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><strong>Example data.</strong> Some of the last 30 days are made-up example numbers until you add your own in <Link href="/dashboard/scorecard" className="underline">Your numbers</Link>.</p>}

      <VanityNote className="mt-6" />

      <section className="mt-6" aria-labelledby="ladder-h">
        <h2 id="ladder-h" className="sr-only">Your goals against the last 30 days</h2>
        <GoalsLadder variant="track" goals={g.goals} merPct={g.merPct} actuals={g.actuals} />
        <p className="mt-3 text-xs text-slate-500">Click-through rate comes from Meta when it is connected. Add-to-cart rate needs the Shopify connection (coming soon); until then, find it in Shopify Analytics under Conversion rate breakdown. Ratings: on track, close (within 15%) or off track.</p>
      </section>

      <section className="card mt-8 p-5" aria-labelledby="adds-h">
        <h2 id="adds-h" className="font-semibold">What these goals add up to in a month</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-5">
          {[
            ["Orders", Math.round(g.implied.orders).toLocaleString("en-AU")],
            ["Sales (vanity)", fmtGoal("money", g.implied.revenue)],
            ["Ad spend", fmtGoal("money", g.implied.adSpend)],
            ["Contribution", fmtGoal("money", g.implied.contribution)],
            ["Net profit", fmtGoal("money", g.implied.netProfit)],
          ].map(([k, v]) => (
            <div key={k} className={`rounded-lg px-3 py-2 ${k === "Net profit" ? "bg-emerald-50" : "bg-paper-2"}`}><dt className="text-xs text-slate-500">{k}</dt><dd className="font-semibold tabular-nums">{v}</dd></div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-slate-500">Visits × conversion rate × average order = sales. Sales × contribution margin, minus your fixed costs of {fmtGoal("money", g.fixedCostsMonthly)} a month, = net profit. If net profit here is below your net profit goal, one of the rungs above needs to move.</p>
      </section>

      <form action={saveGoalsAction} className="card mt-8 p-5">
        <h2 className="font-semibold">Change your goals</h2>
        <p className="mt-1 text-sm text-slate-600">Monthly numbers. Blank fields keep their current value. The MER target is the same one used in Your numbers and the Dashboard.</p>
        <div className="mt-4"><GoalsFields values={g.goals} merPct={g.merPct} /></div>
        <button className="btn-primary mt-5 px-5 py-2.5">Save goals</button>
      </form>
    </div>
  );
}
