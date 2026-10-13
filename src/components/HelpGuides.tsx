import { HELP_GUIDES, SUPPORT_EMAIL, supportMailto } from "@/lib/support";

export function HelpGuides() {
  return (
    <div className="space-y-6">
      {HELP_GUIDES.map((g) => (
        <section key={g.id} id={g.id} className="card scroll-mt-20 p-6">
          <h2 className="text-lg font-semibold">{g.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{g.why}</p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-800">
            {g.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
          <p className="mt-3 text-xs text-slate-500">Stuck on a step? <a className="underline" href={supportMailto(g.title)}>Email {SUPPORT_EMAIL}</a>.</p>
        </section>
      ))}
    </div>
  );
}
