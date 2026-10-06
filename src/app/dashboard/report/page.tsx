import { WEEKLY_REPORT as R } from "@/lib/seed/report";

export default function Report() {
  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">Example report</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Weekly report</h1>
      <p className="mt-1 text-slate-600">{R.week}</p>
      <p className="mt-6 rounded-2xl bg-ink p-6 text-lg font-medium leading-8 text-white">{R.headline}</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {R.scorecard.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="mt-1 text-xl font-bold">{s.value}</p>
            <p className={`text-xs font-medium ${s.change.startsWith("-") && s.label !== "MER" ? "text-rose-600" : "text-emerald-600"}`}>{s.change}</p>
          </div>
        ))}
      </div>
      {[
        ["What Helix did", R.did],
        ["What we learned", R.learned],
        ["Next week", R.next],
      ].map(([h, items]) => (
        <section key={h as string} className="card mt-6 p-6">
          <h2 className="font-semibold">{h as string}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
            {(items as string[]).map((i) => <li key={i}>{i}</li>)}
          </ul>
        </section>
      ))}
      <p className="mt-6 text-sm text-slate-600"><strong>One question for you:</strong> {R.question}</p>
    </div>
  );
}
