import Link from "next/link";
import { BookOpen, PiggyBank } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getProfitSetup } from "@/lib/repo";
import { EXAMPLE_INPUTS, waterfall } from "@/lib/profit-setup";
import { lessonLink } from "@/lib/lesson-links";
import { ProfitForm } from "@/components/profit/ProfitForm";
import { MarketingBand } from "@/components/profit/MarketingBand";
import { saveProfit } from "./actions";

export const metadata = { title: "Profit setup" };

export default async function ProfitPage({ searchParams }: PageProps<"/dashboard/profit">) {
  const u = await requireUser("/dashboard/profit");
  const sp = await searchParams;
  const mine = await getProfitSetup(u.id);
  const p = mine ?? EXAMPLE_INPUTS;
  const w = waterfall(p);
  const plain = lessonLink("1.7");
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight"><PiggyBank className="h-7 w-7 text-[#5A50D6]" aria-hidden /> Profit setup</h1>
          <p className="mt-1 max-w-2xl text-slate-600">Enter what one order costs you, layer by layer. Helix shows the profit you keep per order and per month, and uses it across your dashboard. About 5 minutes.</p>
        </div>
        {plain && <Link href={plain.href} className="btn-ghost"><BookOpen className="h-4 w-4" aria-hidden /> Sales, costs and profit in plain English</Link>}
      </div>
      {!mine && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><strong>Example numbers.</strong> A $60 product made overseas. Replace them with yours and save.</div>}
      <div className="mt-5"><ProfitForm initial={p} action={saveProfit} saved={sp.saved === "1"} /></div>
      <div className="mt-6">
        <MarketingBand marketingPct={p.price ? (p.marketingPerOrder / p.price) * 100 : 0} monthlySales={w.month.sales} breakEvenMerPct={w.breakEvenMerPct} example={!mine} />
      </div>
    </div>
  );
}
