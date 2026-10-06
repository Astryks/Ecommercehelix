import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HelixMark } from "@/components/Logo";

export const metadata: Metadata = { title: "About" };

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
      <div className="mt-4 space-y-4 text-lg leading-8 text-slate-700">{children}</div>
    </section>
  );
}

export default function About() {
  return (
    <>
      <div className="helix-glow text-white">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-5 pb-20 pt-12 text-center">
          <HelixMark size={88} className="mx-auto" />
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">About Ecommerce Helix</h1>
          <p className="mt-4 text-lg text-slate-300">Grow your e-commerce business a little every day</p>
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

        <figure className="my-16 rounded-3xl bg-ink p-10 text-center text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">Our mission</p>
          <blockquote className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            <span className="grad-text">To strive to reach six figures and beyond, compounding every day</span>
          </blockquote>
          <figcaption className="mt-4 text-sm text-slate-400">An ambition we work toward with you, not a promise. Every store&apos;s path is different.</figcaption>
        </figure>

        <Block title="Growing a little every day">
          <p>
            Most stores do not grow from one big breakthrough. They grow because someone fixes one thing today, tests one ad tomorrow and sends one better email the day after. Improve a few things by a small amount each day and the gains build on each other, like interest.
          </p>
          <p>Helix turns that habit into a short daily plan: up to three tasks, the reason behind each one, and a checklist to get it done.</p>
        </Block>

        <Block title="Why Black Friday matters">
          <p>
            For most online stores, the Black Friday and Cyber Monday window is the biggest sales period of the year. How it goes is usually decided weeks before it starts: the offer you choose, the creative you prepare, the size of your email list, the stock you hold and how fast your site loads under pressure.
          </p>
          <p>Helix starts you on that runway early, so the big weekend is a plan you run rather than a scramble.</p>
        </Block>

        <Block title="Why you should stay in control">
          <p>
            Handing everything to an outside agency can feel like a relief. The risk is that you slowly lose sight of your own business: who your customers are, what your data says and where your money goes. When the relationship ends, the knowledge often leaves with it.
          </p>
          <p>
            We believe owners should hold the keys. Your ad accounts, your customer list and your numbers should stay yours, and you should understand the decisions being made with them.
          </p>
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
