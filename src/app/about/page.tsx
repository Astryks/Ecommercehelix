import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HelixMark } from "@/components/Logo";
import { StageTrio } from "@/components/StageTrio";
import { WHO_HEADLINE } from "@/lib/audience";
import { GOALS_HEADLINE, LADDER } from "@/lib/goals";

export const metadata: Metadata = { title: "About" };

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <div className="rule-accent" /><h2 className="mt-5 text-3xl text-slate-900">{title}</h2>
      <div className="mt-4 space-y-4 text-lg leading-8 text-slate-700">{children}</div>
    </section>
  );
}

export default function About() {
  return (
    <>
      <SiteHeader />
      <div className="border-b border-slate-200 bg-paper">
        <div className="mx-auto max-w-3xl px-5 pb-20 pt-16 text-center">
          <HelixMark size={84} className="mx-auto" />
          <p className="eyebrow mt-8">About</p>
          <h1 className="mt-3 text-5xl text-slate-900 sm:text-6xl">About Ecommerce Helix</h1>
          <p className="mt-5 font-display text-xl italic text-slate-600">Grow your e-commerce business a little every day</p>
        </div>
      </div>
      <main className="mx-auto max-w-3xl px-5 py-16">
        <Block title="Why the name">
          <p>
            A helix is a spiral, the shape of a corkscrew or a spiral staircase. Each turn takes you a little higher than the last. The double helix of DNA carries the instructions for growth in every living thing.
          </p>
          <p>
            That is what we want Helix to be for your store: clear instructions for growth, and a staircase you climb a little higher every day, step by step.
          </p>
        </Block>

        <figure className="helix-glow my-16 rounded-xl p-10 text-center text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Our mission</p>
          <blockquote className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            <span className="italic text-cyan-200">To strive to reach six figures and beyond, compounding every day</span>
          </blockquote>
          <figcaption className="mt-4 text-sm text-slate-400">An ambition we work toward with you, not a promise. Every store&apos;s path is different.</figcaption>
        </figure>

        <Block title="Growing a little every day">
          <p>
            Most stores do not grow from one big breakthrough. They grow because someone fixes one thing today, tests one ad tomorrow and sends one better email the day after. Improve a few things by a small amount each day and the gains build on each other, like interest.
          </p>
          <p>Helix turns that habit into a short daily plan: up to three tasks, the reason behind each one, and a checklist to get it done.</p>
        </Block>

        <Block title="Attract, Convert, Grow">
          <p>
            Everything Helix teaches fits into three stages. <strong>Attract</strong> gets the right people to your store with ads, creative, content and social. <strong>Convert</strong> turns those visits into sales with a strong offer, a store people trust, a smooth checkout and emails that bring them back. <strong>Grow</strong> keeps more of every sale and scales it: daily profit, safer budgets, repeat customers, stock, suppliers and the admin that holds it together.
          </p>
          <p>
            Every module and lesson is tagged with its stage, and Today shows which one your lesson is in, so you always know whether you are working on getting buyers in, turning them into customers or growing the profit. <Link href="/learn" className="text-cyan-700 underline">See the stages in Learn</Link>.
          </p>
        </Block>
        <div className="mt-8"><StageTrio compact /></div>

        <Block title="Why Black Friday matters all year">
          <p>
            For many online stores, Black Friday and Cyber Monday is the biggest sales window of the year. How it goes is decided months before it starts: the ads and offers you have tested, the stock you ordered in time, the size of your email list and how ready your site is for the rush.
          </p>
          <p>
            The stores that do best start testing in August, order stock and lock the offer in September, build in October and launch in November with what they already know works. Helix starts your plan on 1 August, puts each step on Today and your calendar, and nudges you to keep testing through the rest of the year, so the big weekend is a plan you run rather than a scramble.
          </p>
        </Block>

        <Block title="Why you should stay in control">
          <p>
            Handing everything to an outside agency can feel like a relief. But many owners pay a high monthly retainer and still do not see results, and it is hard to check, because full transparency is rarely in an agency&apos;s interest: the less you understand, the more you need them. Over time you can lose sight of your own business: who your customers are, what your data says and where your money goes. When the contract ends, the know-how often leaves with it.
          </p>
          <p>
            We believe owners should hold the keys. Your ad accounts, your customer list and your numbers should stay yours, and you should understand the decisions being made with them. Helix helps you take control and grow your business a little every day, so each small gain builds on the last and compounding works for you, not for someone else&apos;s retainer.
          </p>
          <p className="text-base text-slate-500">Good agencies do exist. If you work with one, Helix helps you read their results with your own eyes.</p>
        </Block>

        <Block title="Who Helix is for">
          <p className="font-display text-2xl leading-snug text-slate-900">{WHO_HEADLINE.title}.</p>
          <p>{WHO_HEADLINE.body}</p>
          <p>
            In bands: <strong>Just starting</strong> (no sales yet, or under about $10k a month), <strong>Growing</strong> (about $10k to $100k a month, up to about $1M a year, where Helix adds the most) and <strong>Scaling</strong> (about $1M to $10M a year). <Link href="/learn/goals" className="text-cyan-700 underline">See the bands and the goals to aim at</Link>.
          </p>
        </Block>

        <Block title="The goal is profit, not just revenue">
          <p>
            Sales are easy to celebrate and easy to buy with discounts and ad spend. Profit is what pays you. {GOALS_HEADLINE.order}
          </p>
          <ol className="grid gap-2 text-base sm:grid-cols-3">
            {LADDER.map((s, i) => (
              <li key={s.key} className={`rounded-lg border px-3 py-2 ${s.key === "netProfit" ? "border-emerald-300 bg-emerald-50 font-semibold text-emerald-900" : "border-slate-200 bg-white"}`}>
                <span className="mr-2 text-slate-400">{i + 1}</span>{s.label}
              </li>
            ))}
          </ol>
        </Block>

        <Block title="A head of growth by your side">
          <p>
            Helix guides, explains and does the work, but only with your approval. Every suggestion comes with the why. Every change waits in your approval queue. You learn as you go, and your business gets stronger because you understand it better.
          </p>
        </Block>

        <div className="mt-16 flex flex-wrap gap-3">
          <Link href="/dashboard" className="btn-primary">Start free</Link>
          <Link href="/learn" className="btn-ghost">Browse the Learn library</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
