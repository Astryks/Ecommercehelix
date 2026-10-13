import Link from "next/link";

/** Call to action at the end of every feature page and guide. */
export function ConsultCta() {
  return (
    <aside className="mt-16 rounded-2xl bg-ink p-8 text-white">
      <h2 className="text-2xl font-semibold">Get your free store check and daily growth plan</h2>
      <p className="mt-3 max-w-2xl text-slate-300">Paste your store link and Helix finds the fixes most likely to make you money, then gives you one clear task a day. Free to start, and nothing changes in your store or ad accounts without your approval.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/start" className="btn-primary">Start free</Link>
        <Link href="/#pricing" className="btn border border-white/25 text-white hover:bg-white/10">See pricing</Link>
      </div>
    </aside>
  );
}
