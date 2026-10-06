import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, ClipboardCheck, GraduationCap, KeyRound, ShieldAlert, X, ListChecks, Search, Sparkles, TrendingUp, Flame, ShieldCheck, Clock, DollarSign, Scale, Target } from "lucide-react";
import { StageTrio } from "@/components/StageTrio";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HelixMark } from "@/components/Logo";
import { Pricing } from "@/components/marketing/Pricing";
import { STRATEGIES } from "@/lib/seed/strategies";
import { TRENDS } from "@/lib/seed/trends";
import { SeasonalStrip } from "@/components/SeasonalBanner";
import { BFCM_CRITICAL, primaryAlert } from "@/lib/seasons";
import { BfcmTimeline, bfcmStageIndex } from "@/components/BfcmPlan";
import { GoalsLadder, VanityNote } from "@/components/GoalsLadder";
import { WhoFor } from "@/components/WhoFor";
import { WHO_HEADLINE } from "@/lib/audience";
import { GOALS_HEADLINE } from "@/lib/goals";
import { isoDay } from "@/lib/dates";

// Rebuild at least hourly so the seasonal alert follows the real date.
export const revalidate = 3600;

const STEPS = [
  { icon: Search, title: "Check", text: "Paste your store link. Helix checks your store, ads and emails and finds the fixes that will make you the most money." },
  { icon: ListChecks, title: "One thing a day", text: "Each day you get one short lesson and one clear task, explained step by step. About 15 minutes." },
  { icon: ClipboardCheck, title: "You approve", text: "Want Helix to do it for you? Tap the button. Helix prepares the work, and nothing changes until you say yes." },
  { icon: TrendingUp, title: "Watch profit grow", text: "Add yesterday's numbers each morning and see your profit. Small daily wins add up fast." },
];

const PROFIT_POINTS = [
  { icon: DollarSign, title: "Profit is the number that counts", text: "Sales and followers look nice. Profit is what pays you. Every lesson, task and alert in Helix is judged by one question: does it grow your profit?" },
  { icon: Scale, title: "You need to spend on ads to make revenue", text: "It feels counter-intuitive, but for most stores, ads are how new customers find you. Helix makes sure you scale profitably. It sets a break-even target for your ads (the most you can pay for a sale and still make money), so you spend only while each sale is profitable, and pull back when it is not." },
  { icon: Target, title: "Meta and Google still work", text: "Meta (Facebook and Instagram) and Google can seem saturated. Everyone says they are too crowded and too expensive. But they are still what works for most stores. The winners simply do the basics well, every day." },
];

const FEAR_POINTS = [
  { icon: ShieldAlert, title: "Why small tests fail", text: "Meta and Google need enough sales to learn who buys from you. A tiny budget, or switching ads off after three days, means they never get there. Helix tells you what a fair test costs at your prices before you spend a dollar." },
  { icon: Scale, title: "A safe limit on every dollar", text: "Helix works out your break-even cost per sale from your own numbers. You can see when an ad is making money, when to give it more and when to stop." },
  { icon: GraduationCap, title: "Learn how it really works", text: "Short daily lessons and click-by-click drawings show you how campaigns, audiences and creative fit together. Helix can build campaigns as paused drafts, so nothing spends until you press go." },
];

const AGENCY_ROWS = [
  ["A high monthly retainer, whether or not sales grow", "A low monthly plan. Your money goes into ads and stock, not fees"],
  ["Reports that are hard to check", "Your real profit every morning, worked out from your own numbers"],
  ["The less you understand, the more you need them", "Every suggestion comes with the why, so you understand your business better each week"],
  ["The know-how leaves when the contract ends", "The skills you learn stay with you and your team"],
];

const FAQ = [
  { q: "Who is Helix for?", a: "Helix is built for stores doing $10k to $100k a month that want to reach a $1M year, profitably. That is where it adds the most. It also works from your very first sale, and keeps helping as you scale toward $10M a year. Pick Just starting or Growing when you sign up, and Helix sets your lessons and goals to match." },
  { q: "Is Helix an agency?", a: "No. Helix is software that works like a growth expert by your side. Your ad accounts, data and customers stay yours, and you approve every change." },
  { q: "Will Helix spend money on my ad accounts?", a: "No. Helix builds campaigns inside your own Meta or Google account as paused drafts. You review them and press Launch yourself, and every budget change on a live campaign is yours to make. Prefer to build it yourself? Guide me mode gives you proven structures, example ads and a click-by-click checklist." },
  { q: "Which platforms work today?", a: "Meta (Facebook and Instagram ads) connects today: Helix reads your results each morning and can build new campaigns as paused drafts. You add sales in one quick form or by CSV. Shopify, Google Ads and Klaviyo connections come next." },
  { q: "How does the AI balance work?", a: "Paid plans include a monthly AI allowance. Extra usage comes from a prepaid balance you top up. When it reaches $0, AI actions stop. You are never billed beyond what you loaded." },
  { q: "I have never run ads. Is this for me?", a: "Yes. Every task is written in plain English with numbered steps and simple drawings that show where to click. Any tricky word is explained in one line, like ROAS: how many dollars of sales you get for each $1 of ads." },
  { q: "Why does Helix talk about profit so much?", a: "Because profit is what you keep. A store can grow sales and still lose money. Helix shows profit first, sets a break-even line for your ads, and only suggests spending more while each sale still makes money." },
  { q: "Can Helix promise results?", a: "No honest tool can. Helix focuses on proven basics done consistently: know your numbers, test creative, fix the site, build your list, and compound small gains." },
];

function MorningBrief() {
  const bars = [38, 44, 31, 52, 47, 58, 64];
  return (
    <figure className="card relative overflow-hidden p-0" aria-label="Example of the Helix morning view">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Your morning, in Helix</span>
        <span className="text-xs text-slate-500">Example store</span>
      </div>
      <div className="px-6 pb-6 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Profit yesterday</p>
        <p className="mt-1 flex items-baseline gap-3">
          <span className="font-display text-5xl font-semibold tracking-tight text-emerald-700">$412</span>
          <span className="text-sm font-medium text-emerald-700">+14% vs 7-day average</span>
        </p>
        <svg viewBox="0 0 280 72" className="mt-4 h-16 w-full" role="img" aria-label="Profit for the last 7 days, rising">
          <line x1="0" y1="71" x2="280" y2="71" stroke="#e6dfd3" />
          {bars.map((b, i) => (
            <rect key={i} x={i * 40 + 6} y={71 - b} width="28" height={b} rx="2" fill={i === bars.length - 1 ? "#2f7359" : "#d3c9b9"} />
          ))}
        </svg>
        <dl className="mt-5 grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200 text-center">
          {[["Sales", "$2,184"], ["Ad cost per sale", "$17.70"], ["Break-even", "$31.40"]].map(([k, v]) => (
            <div key={k} className="px-2 py-3">
              <dt className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{k}</dt>
              <dd className="mt-1 font-display text-lg font-semibold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 rounded-lg bg-paper-2 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">Today, 15 minutes</p>
          <p className="mt-1 font-display text-lg font-semibold leading-snug">Set a free-shipping amount a little above your average order</p>
          <p className="mt-1 text-sm text-slate-600">Step by step, with a drawing of where to click. Or let Helix do it after you approve.</p>
        </div>
      </div>
    </figure>
  );
}

export default function Home() {
  const alert = primaryAlert(isoDay());
  return (
    <>
      {alert && <SeasonalStrip alert={alert} />}
      <SiteHeader />
      <div className="relative overflow-hidden bg-paper">
        <HelixMark size={620} className="pointer-events-none absolute -right-40 -top-24 opacity-[0.05]" title="" />
        <section className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-16 md:pt-24 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="eyebrow flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" aria-hidden /> Profit first. One small step a day.</p>
            <h1 className="mt-6 text-5xl leading-[1.04] text-slate-900 sm:text-6xl lg:text-[4.25rem]">
              Grow your <span className="whitespace-nowrap">e-commerce</span> business <span className="grad-text">a little every day</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
              Helix shows you your profit every day, gives you one simple task to grow it, explains it step by step, and can do the work for you when you approve. Small daily wins add up to a bigger, more profitable business.
            </p>
            <form action="/start" method="get" className="mt-9 flex max-w-xl flex-col gap-2 rounded-xl border border-slate-300 bg-white p-2 shadow-[0_1px_0_rgba(11,31,58,0.04)] sm:flex-row">
              <label htmlFor="url" className="sr-only">Paste your store URL</label>
              <input id="url" name="url" type="text" required placeholder="Paste your store URL, e.g. yourstore.com" className="flex-1 rounded-lg bg-transparent px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:outline-none" />
              <button className="btn-primary px-6 py-3 text-base" type="submit">
                Get my free audit <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </form>
            <ul className="mt-6 flex flex-wrap gap-x-7 gap-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden /> Nothing changes without your approval</li>
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-cyan-600" aria-hidden /> 15 minutes a day</li>
              <li className="flex items-center gap-2"><Flame className="h-4 w-4 text-cyan-600" aria-hidden /> Free to start</li>
            </ul>
          </div>
          <MorningBrief />
        </section>
      </div>

      <main>
        <section id="framework" aria-labelledby="framework-title" className="scroll-mt-10 border-t border-slate-200 bg-white py-24">
          <div className="mx-auto max-w-6xl px-5">
            <p className="eyebrow">The Helix framework</p>
            <h2 id="framework-title" className="mt-3 text-4xl text-slate-900 sm:text-6xl">Attract. Convert. <span className="grad-text">Grow.</span></h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Every store grows the same way: bring the right people in, turn them into buyers, then keep more of every sale and do it again. Every Helix lesson sits in one of these three stages, and Today shows you which one you are working on.</p>
            <div className="mt-12"><StageTrio hrefFor={(id) => `/learn#${id}`} /></div>
          </div>
        </section>

        <section id="who" aria-labelledby="who-title" className="scroll-mt-10 border-t border-slate-200 bg-paper py-24">
          <div className="mx-auto max-w-6xl px-5">
            <p className="eyebrow">Who Helix is for</p>
            <h2 id="who-title" className="mt-3 max-w-4xl text-4xl text-slate-900 sm:text-5xl">Built for stores doing <span className="grad-text">$10k to $100k a month</span> that want to reach a $1M year, profitably</h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{WHO_HEADLINE.body}</p>
            <div className="mt-12"><WhoFor /></div>
          </div>
        </section>

        <section id="goals" aria-labelledby="goals-title" className="scroll-mt-10 border-t border-slate-200 bg-white py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="eyebrow">What to aim at</p>
              <h2 id="goals-title" className="mt-3 text-4xl text-slate-900 sm:text-5xl">The goal is profit, <span className="grad-text">not just revenue.</span></h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">{GOALS_HEADLINE.order}</p>
              <p className="mt-4 text-lg leading-8 text-slate-600">Each rung feeds the next. Set monthly targets when you sign up, and Helix checks them against your real results on Today and the Dashboard, so you always know which number to work on next.</p>
              <VanityNote className="mt-6" />
              <Link href="/learn/goals" className="btn-ghost mt-6">What good looks like for each number <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
            <GoalsLadder variant="teaser" />
          </div>
        </section>

        <section id="profit" aria-labelledby="profit-title" className="scroll-mt-10 border-t border-slate-200 bg-white py-24">
          <div className="mx-auto max-w-6xl px-5">
            <p className="eyebrow">It is all about the bottom line</p>
            <h2 id="profit-title" className="mt-3 text-4xl text-slate-900 sm:text-6xl">
              Profit, profit, <span className="grad-text">profit.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Not sales. Not followers. Not likes. Helix puts your profit at the top of the screen every day and helps you grow it one small step at a time.</p>
            <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-slate-200">
              {PROFIT_POINTS.map((p, i) => (
                <article key={p.title} className="md:px-8 md:first:pl-0 md:last:pr-0">
                  <div className="rule-accent pt-5">
                    <span className="flex items-center gap-3 text-sm font-semibold text-cyan-700"><span className="font-display text-2xl">0{i + 1}</span><p.icon className="h-4 w-4" aria-hidden /></span>
                  </div>
                  <h3 className="mt-3 text-xl text-slate-900">{p.title}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-slate-600">{p.text}</p>
                </article>
              ))}
            </div>
            <div className="helix-glow mt-16 grid items-center gap-8 rounded-xl p-10 text-white md:grid-cols-[1fr_auto]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">What you see every morning</p>
                <p className="mt-2 font-display text-5xl font-semibold tracking-tight text-emerald-300">$412 <span className="font-sans text-lg font-medium text-slate-300">profit yesterday</span></p>
                <p className="mt-3 max-w-xl text-slate-200">&ldquo;Better than your 7-day average of $361. Keep doing what worked and do today&apos;s lesson.&rdquo;</p>
              </div>
              <p className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Let&apos;s grow a little <span className="italic text-cyan-300">every day.</span></p>
            </div>
          </div>
        </section>

        <section id="ads-fear" aria-labelledby="fear-title" className="scroll-mt-10 border-t border-slate-200 bg-paper-2 py-24">
          <div className="mx-auto max-w-6xl px-5">
            <p className="eyebrow">Nervous about ads?</p>
            <h2 id="fear-title" className="mt-3 max-w-4xl text-4xl text-slate-900 sm:text-5xl">Most owners are scared to advertise. <span className="grad-text">Helix shows you how it really works.</span></h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">It usually goes like this. You are worried about wasting money, so you put a little into Meta or Google, nothing much comes back after a week, and you decide ads are not for you. But a tiny budget switched off early never had a fair chance. Helix explains how Meta and Google ads actually work, in plain words, so you can spend with a plan instead of a knot in your stomach.</p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {FEAR_POINTS.map((p) => (
                <article key={p.title} className="card p-6">
                  <p.icon className="h-5 w-5 text-cyan-600" aria-hidden />
                  <h3 className="mt-4 text-xl text-slate-900">{p.title}</h3>
                  <p className="mt-2 text-[15px] leading-7 text-slate-600">{p.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="agencies" aria-labelledby="agency-title" className="scroll-mt-10 border-t border-slate-200 bg-white py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="eyebrow flex items-center gap-2"><KeyRound className="h-3.5 w-3.5" aria-hidden /> Stay in control</p>
              <h2 id="agency-title" className="mt-3 text-4xl text-slate-900 sm:text-5xl">You do not need an expensive agency <span className="grad-text">to grow</span></h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">Many owners pay an agency a high monthly retainer and still do not see results. It is hard to check what is working, because full transparency is rarely in an agency&apos;s interest: the less you understand, the more you need them.</p>
              <p className="mt-4 text-lg leading-8 text-slate-600">Helix turns that around. Your ad accounts, data and customers stay yours, you see every number, and you learn why each decision is made. Take control of your business, grow it a little every day, and let compounding work for you.</p>
              <p className="mt-4 text-sm text-slate-500">Good agencies do exist. If you work with one, Helix helps you read their results with your own eyes.</p>
            </div>
            <div className="card overflow-hidden p-0">
              <div className="grid grid-cols-2 border-b border-slate-200 bg-paper-2 text-xs font-semibold uppercase tracking-[0.14em]">
                <p className="px-5 py-3 text-slate-500">A typical agency</p>
                <p className="border-l border-slate-200 px-5 py-3 text-emerald-700">With Helix</p>
              </div>
              {AGENCY_ROWS.map(([a, h]) => (
                <div key={a} className="grid grid-cols-2 border-b border-slate-100 text-sm leading-6 last:border-b-0">
                  <p className="flex gap-2 px-5 py-4 text-slate-600"><X className="mt-1 h-4 w-4 flex-none text-rose-500" aria-hidden />{a}</p>
                  <p className="flex gap-2 border-l border-slate-100 px-5 py-4 text-slate-800"><Check className="mt-1 h-4 w-4 flex-none text-emerald-600" aria-hidden />{h}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="bfcm" aria-labelledby="bfcm-title" className="helix-glow scroll-mt-10 py-24 text-white">
          <div className="mx-auto max-w-6xl px-5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300"><AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Black Friday and Cyber Monday, all year</p>
            <h2 id="bfcm-title" className="mt-3 max-w-4xl text-4xl sm:text-5xl">{BFCM_CRITICAL.title}</h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200"><strong className="font-semibold text-white">{BFCM_CRITICAL.lead}</strong> {BFCM_CRITICAL.body}</p>
            <p className="mt-4 max-w-3xl text-slate-300">Helix starts your plan on 1 August, puts every step on Today and your calendar on the right date, and adds the whole plan in one click. The rest of the year, it nudges you to keep testing so you start the season ahead.</p>
            <div className="mt-10"><BfcmTimeline current={bfcmStageIndex(isoDay())} dark /></div>
            <Link href="/start" className="btn mt-10 border border-white/25 text-white hover:bg-white/10">Get the free Black Friday plan <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
        </section>

        <section id="how" className="scroll-mt-10 border-t border-slate-200 py-24">
          <div className="mx-auto max-w-6xl px-5">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 text-3xl text-slate-900 sm:text-5xl">Check. One thing a day. Approve. Grow.</h2>
            <ol className="mt-14 grid gap-10 md:grid-cols-4 md:gap-8">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rule-accent pt-6">
                  <span className="flex items-center justify-between">
                    <span className="font-display text-4xl font-semibold text-slate-300">{i + 1}</span>
                    <s.icon className="h-5 w-5 text-cyan-600" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-xl text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-7 text-slate-600">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="strategies" className="scroll-mt-10 border-t border-slate-200 bg-paper-2 py-24">
          <div className="mx-auto max-w-6xl px-5">
            <p className="eyebrow">Growth strategies</p>
            <h2 className="mt-3 text-3xl text-slate-900 sm:text-5xl">One strategy at a time, explained simply</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">For each one, Helix tells you what to do, why it matters and how to do it, step by step. Then it asks: want me to do it for you? You see the effect in your daily numbers.</p>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STRATEGIES.map((s, i) => (
                <article key={s.id} className="card flex flex-col p-6">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Strategy 0{i + 1}</span>
                  <h3 className="mt-3 text-lg leading-snug text-slate-900">{s.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-700"><strong className="font-semibold text-slate-900">What:</strong> {s.what}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700"><strong className="font-semibold text-slate-900">Why:</strong> {s.why}</p>
                  <ol className="mt-2 flex-1 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700 marker:text-slate-400">{s.how.map((h) => <li key={h}>{h}</li>)}</ol>
                  <div className="mt-5 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-700">
                    <span className="font-semibold text-slate-900">Want me to do it for you? </span>{s.helix}
                    <span className="mt-1 block text-slate-500">You will see it in: {s.watch}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Pricing />

        <section className="helix-glow py-24 text-white">
          <div className="mx-auto max-w-6xl px-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Ad Trends</p>
                <h2 className="mt-3 text-3xl sm:text-5xl">What changed in ads this week, in plain English</h2>
              </div>
              <Link href="/dashboard/trends" className="btn border border-white/25 text-white hover:bg-white/10">See all trends <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {TRENDS.slice(0, 3).map((t) => (
                <article key={t.id} className="border-t border-white/20 pt-6">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">{t.channel}</span>
                  <h3 className="mt-3 text-xl">{t.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{t.summary}</p>
                  <p className="mt-4 text-sm text-emerald-200"><strong>Try it:</strong> {t.tryIt}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-10 py-24">
          <div className="mx-auto max-w-3xl px-5">
            <p className="eyebrow">FAQ</p>
            <h2 className="mt-3 text-3xl text-slate-900 sm:text-5xl">Good questions</h2>
            <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
              {FAQ.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="cursor-pointer list-none font-display text-lg font-semibold text-slate-900 marker:hidden">
                    <span className="flex items-center justify-between gap-4">{f.q}<span className="font-sans text-xl font-normal text-cyan-600 transition group-open:rotate-45">+</span></span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-7 text-slate-600">{f.a}</p>
                </details>
              ))}
            </div>
            <div className="mt-14 text-center">
              <Link href="/dashboard" className="btn-primary px-6 py-3 text-base">Start growing today <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
