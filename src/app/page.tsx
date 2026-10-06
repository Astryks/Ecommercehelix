import Link from "next/link";
import { ArrowRight, ClipboardCheck, ListChecks, Search, Sparkles, TrendingUp, Flame, ShieldCheck, Clock } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HelixMark } from "@/components/Logo";
import { Pricing } from "@/components/marketing/Pricing";
import { STRATEGIES } from "@/lib/seed/strategies";
import { TRENDS } from "@/lib/seed/trends";

const STEPS = [
  { icon: Search, title: "Audit", text: "Paste your store URL. Helix keeps auditing speed, product pages, checkout, email and ads, connects the dots and ranks the fixes worth the most." },
  { icon: ListChecks, title: "Daily plan", text: "Every day: one short lesson, one topic and one clear action, plus what Helix noticed in your store and ads. Fifteen focused minutes." },
  { icon: ClipboardCheck, title: "Approve", text: "Tap 'I'll do it for you' and Helix drafts the work: fixes, ads, email flows. Nothing changes until you approve." },
  { icon: TrendingUp, title: "Grow", text: "Your scorecard, streak and compound score show the gains stacking up. Small wins, every day, add up fast." },
];

const FAQ = [
  { q: "Is Helix an agency?", a: "No. Helix is software that works like a head of growth by your side. You keep ownership of your ad accounts, data and customers, and you approve every change." },
  { q: "Will Helix spend money on my ad accounts?", a: "No. Helix builds campaigns inside your own Meta or Google account as paused drafts. You review them and press Launch yourself, and every budget change on a live campaign is yours to make. Prefer to build it yourself? Guide me mode gives you proven structures, example ads and a click-by-click checklist." },
  { q: "Which platforms work today?", a: "This version runs on manual entry and CSV import for the scorecard, with example data for ads. Shopify, Meta Ads, Google Ads and Klaviyo connections are on the roadmap and stubbed in the app." },
  { q: "How does the AI balance work?", a: "Paid plans include a monthly AI allowance. Extra usage comes from a prepaid balance you top up. When it reaches $0, AI actions stop. You are never billed beyond what you loaded." },
  { q: "I have never run ads. Is this for me?", a: "Yes. Every task comes with a plain-English guide and a Learn library, from unit economics to campaign planning, so you understand what is happening and why." },
  { q: "Can Helix promise results?", a: "No honest tool can. Helix focuses on proven basics done consistently: know your numbers, test creative, fix the site, build your list, and compound small gains." },
];

export default function Home() {
  return (
    <>
      <div className="helix-glow relative overflow-hidden text-white">
        <SiteHeader />
        <HelixMark size={560} className="pointer-events-none absolute -right-32 top-10 opacity-[0.08]" title="" />
        <section className="relative mx-auto max-w-6xl px-5 pb-24 pt-14 md:pt-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Your head of growth, by your side
            </span>
            <div className="mt-6 flex items-center gap-4">
              <HelixMark size={64} />
              <span className="text-xl font-semibold tracking-tight">Ecommerce <span className="grad-text">Helix</span></span>
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Grow your e-commerce business <span className="grad-text">a little every day</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Helix audits your store, hands you the three tasks that matter most today, explains why, and does the work when you approve. Small daily wins that compound into a bigger business.
            </p>
            <form action="/start" method="get" className="mt-9 flex max-w-xl flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur sm:flex-row">
              <label htmlFor="url" className="sr-only">Paste your store URL</label>
              <input id="url" name="url" type="text" required placeholder="Paste your store URL, e.g. yourstore.com" className="flex-1 rounded-xl bg-transparent px-4 py-3 text-base text-white placeholder:text-slate-400 focus:outline-none" />
              <button className="btn-primary px-6 py-3 text-base" type="submit">
                Get my free audit <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </form>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden /> Nothing changes without your approval</li>
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-cyan-300" aria-hidden /> 15 minutes a day</li>
              <li className="flex items-center gap-2"><Flame className="h-4 w-4 text-violet-300" aria-hidden /> Free to start</li>
            </ul>
          </div>
        </section>
      </div>

      <main>
        <section id="how" className="scroll-mt-10 py-24">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">How it works</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Audit. Daily plan. Approve. Grow.</h2>
            <ol className="mt-12 grid gap-6 md:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="card relative p-6">
                  <span className="absolute right-5 top-5 text-5xl font-bold text-slate-100">{i + 1}</span>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950">
                    <s.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="strategies" className="scroll-mt-10 bg-white py-24">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Strategies</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Proven plays, run with you</h2>
            <p className="mt-3 max-w-2xl text-slate-600">Each strategy becomes a sequence of daily tasks. You learn the play, Helix handles the heavy lifting.</p>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STRATEGIES.map((s) => (
                <article key={s.id} className={`flex flex-col rounded-2xl border border-slate-200 bg-gradient-to-br ${s.tone} p-6`}>
                  <span className="text-3xl" aria-hidden>{s.emoji}</span>
                  <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-700">{s.desc}</p>
                  <div className="mt-4 rounded-xl bg-white/80 p-3 text-xs leading-5 text-slate-700">
                    <span className="font-semibold text-slate-900">What Helix does for you: </span>
                    {s.helix}
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
                <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">Ad Trends</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">What changed in ads this week, in plain English</h2>
              </div>
              <Link href="/dashboard/trends" className="btn border border-white/20 text-white hover:bg-white/10">See all trends <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {TRENDS.slice(0, 3).map((t) => (
                <article key={t.id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-cyan-200">{t.channel}</span>
                  <h3 className="mt-4 font-semibold">{t.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{t.summary}</p>
                  <p className="mt-4 text-sm text-emerald-200"><strong>Try it:</strong> {t.tryIt}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-10 py-24">
          <div className="mx-auto max-w-3xl px-5">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">FAQ</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Good questions</h2>
            <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
              {FAQ.map((f) => (
                <details key={f.q} className="group p-5">
                  <summary className="cursor-pointer list-none font-medium text-slate-900 marker:hidden">
                    <span className="flex items-center justify-between">{f.q}<span className="text-slate-400 transition group-open:rotate-45">+</span></span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{f.a}</p>
                </details>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/dashboard" className="btn-primary px-6 py-3 text-base">Start growing today <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
