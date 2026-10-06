import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { GoalsLadder, VanityNote } from "@/components/GoalsLadder";
import { WhoFor } from "@/components/WhoFor";
import { WHO_HEADLINE } from "@/lib/audience";
import { GOALS_HEADLINE } from "@/lib/goals";

export const metadata: Metadata = { title: "The goals ladder: what to aim at" };

export default function GoalsGuide() {
  return (
    <>
      <SiteHeader dark={false} />
      <main className="mx-auto w-full max-w-5xl px-5 py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700"><Link href="/learn" className="hover:underline">Learn</Link> · Goals</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">{GOALS_HEADLINE.title}</h1>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
          {GOALS_HEADLINE.order} That is the order a customer meets your store: they see an ad, visit, add to cart, buy, and leave you some profit. Get each rung a little better and the last one grows. Here is what each number means and what good looks like.
        </p>
        <VanityNote className="mt-6" />
        <div className="mt-8"><GoalsLadder variant="full" /></div>
        <p className="mt-4 text-xs text-slate-500">These ranges are general guides for online stores, not guarantees. They match the explanations on the Helix Dashboard. Your own break-even lines matter most, and Helix works them out from your numbers.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard/goals" className="btn-primary">Set your monthly goals <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          <Link href="/learn" className="btn-ghost">Back to the Playbook</Link>
        </div>

        <section aria-labelledby="who-h" className="mt-16">
          <h2 id="who-h" className="text-3xl text-slate-900">Who Helix is for</h2>
          <p className="mt-3 max-w-3xl font-display text-xl text-slate-900">{WHO_HEADLINE.title}.</p>
          <p className="mt-2 max-w-3xl text-slate-600">{WHO_HEADLINE.body}</p>
          <div className="mt-6"><WhoFor /></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
