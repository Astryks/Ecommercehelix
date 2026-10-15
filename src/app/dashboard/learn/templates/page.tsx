import Link from "next/link";
import { requireUser } from "@/lib/session";
import { TEMPLATES } from "@/lib/templates";
import { siteContent } from "@/lib/site-content";
import { isoDay } from "@/lib/dates";
import { STAGE_INFO } from "@/lib/stages";
import { LostLink } from "@/components/dashboard/LostLink";

export const metadata = { title: "Template library" };

export default async function Templates() {
  await requireUser("/dashboard/learn/templates");
  const hot = siteContent(isoDay()).templates;
  const list = [...TEMPLATES].sort((a, b) => (hot.includes(a.id) ? 0 : 1) - (hot.includes(b.id) ? 0 : 1));
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm"><Link href="/dashboard/learn" className="text-cyan-700 hover:underline">Learn</Link> / Templates</p>
      <h1 className="mt-1 page-title">Template library</h1>
      <p className="page-lead">Ready-to-use words. Copy one, swap the [brackets] for your details, and send.</p>
      <div className="mt-5 space-y-4">
        {list.map((t) => (
          <section key={t.id} id={t.id} className="card p-5">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-hand text-xl text-cyan-700">{t.title}{hot.includes(t.id) && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 align-middle font-sans text-[11px] font-semibold text-amber-900">Right now</span>}</h2>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${STAGE_INFO[t.stage].chip}`}>{STAGE_INFO[t.stage].name}</span>
            </div>
            <p className="mt-1 text-sm text-slate-700">{t.when}</p>
            <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-white p-3 font-sans text-sm text-slate-900">{t.body}</pre>
            <div className="mt-2"><LostLink about={`Using the ${t.title.toLowerCase()} template`} /></div>
          </section>
        ))}
      </div>
    </div>
  );
}
