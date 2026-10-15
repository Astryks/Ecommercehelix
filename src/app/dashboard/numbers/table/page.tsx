import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getDays, getProfitSetup, getRawDays, getSettings } from "@/lib/repo";
import { tableRows } from "@/lib/numbers";
import { DailyTable } from "@/components/dashboard/DailyTable";
import { addDay, importDays, saveCell } from "./actions";

export const metadata = { title: "Daily table" };

export default async function NumbersTable() {
  const u = await requireUser("/dashboard/numbers/table");
  const [days, raw, settings, setup] = await Promise.all([getDays(u.id), getRawDays(u.id), getSettings(u.id), getProfitSetup(u.id)]);
  const unitCost = setup ? setup.productCost + setup.freightDuty + setup.packaging : 0;
  const calc = tableRows(days, settings, unitCost).map((r) => ({ date: r.date, profit: r.profit, roas: r.roas, merPct: r.merPct, convPct: r.convPct, aov: r.aov }));
  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <p className="text-sm"><Link href="/dashboard/numbers" className="text-cyan-700 hover:underline">Numbers</Link> / Daily table</p>
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Daily table</h1>
        <p className="mt-1 text-slate-700">Your sales, costs and ad spend for each day, so Helix can show your real profit and what to fix next. Money in USD.</p>
      </header>
      <DailyTable raw={raw.map((d) => ({ ...d }) as unknown as Record<string, number | string>)} calc={calc} actions={{ addDay, saveCell, importDays }} />
    </div>
  );
}
