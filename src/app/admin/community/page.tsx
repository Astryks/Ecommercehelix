import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Search } from "lucide-react";
import { requireUser } from "@/lib/session";
import { isGroupAdmin } from "@/lib/fb-group/admin";
import { groupPeople, seedDemoGroup, type GroupPerson } from "@/lib/fb-group/store";
import { approveUrl, groupUrl, removeUrl } from "@/lib/fb-group/links";
import { PageHeader } from "@/components/ui/PageHeader";
import { CopyName } from "./CopyName";
import { markDone } from "./actions";

export const metadata = { title: "Members group", robots: { index: false } };
export const dynamic = "force-dynamic";

const TABS = [
  { id: "approve", label: "Pending approval", help: "Paying members waiting to join the Facebook group." },
  { id: "remove", label: "To remove", help: "Members who cancelled. Take them out of the group." },
  { id: "done", label: "Done", help: "Approved or removed." },
] as const;
type Tab = (typeof TABS)[number]["id"];
const inTab = (p: GroupPerson, t: Tab) => (t === "done" ? p.status === "member" || p.status === "done" : p.status === t);
const day = (iso: string) => new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" });

export default async function AdminCommunity({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string }> }) {
  const u = await requireUser("/admin/community");
  if (!isGroupAdmin(u.email)) notFound();
  seedDemoGroup();
  const sp = await searchParams;
  const tab: Tab = TABS.some((t) => t.id === sp.tab) ? (sp.tab as Tab) : "approve";
  const q = (sp.q ?? "").trim().toLowerCase();
  const all = await groupPeople();
  const rows = all.filter((p) => inTab(p, tab) && (!q || `${p.name} ${p.email}`.toLowerCase().includes(q)));
  const g = groupUrl();
  const fb = (p: GroupPerson) => (!g ? null : p.status === "approve" ? approveUrl(g) : p.status === "remove" ? removeUrl(g, p.name) : g);
  const meta = TABS.find((t) => t.id === tab)!;
  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-section pt-block sm:px-6">
      <p className="text-sm"><Link href="/dashboard" className="text-cyan-700 hover:underline">Dashboard</Link> / Members group</p>
      <div className="mt-block">
        <PageHeader title="Members group" lead="Who to let into the private Facebook group, and who to take out." actions={g ? <a href={g} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">Open the group <ExternalLink className="h-4 w-4" aria-hidden /></a> : undefined} />
      </div>
      {!g && <p className="mt-block rounded-xl bg-amber-50 p-card text-sm text-amber-900 ring-1 ring-amber-200">The group link (FB_GROUP_URL) is not set, so new members do not get a join email yet.</p>}

      <nav className="mt-block flex gap-2 overflow-x-auto" aria-label="Lists">
        {TABS.map((t) => {
          const n = all.filter((p) => inTab(p, t.id)).length;
          const on = t.id === tab;
          return (
            <Link key={t.id} href={`/admin/community?tab=${t.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`} aria-current={on ? "page" : undefined}
              className={`inline-flex flex-none items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ${on ? "bg-[#5A50D6] text-white ring-[#5A50D6]" : "bg-white text-slate-800 ring-slate-300 hover:bg-slate-50"}`}>
              {t.label} <span className={`rounded-full px-2 text-xs ${on ? "bg-white/25" : t.id !== "done" && n ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-600"}`}>{n}</span>
            </Link>
          );
        })}
      </nav>

      <form className="mt-lead flex gap-2" role="search">
        <input type="hidden" name="tab" value={tab} />
        <label htmlFor="q" className="sr-only">Search by name or email</label>
        <input id="q" name="q" defaultValue={sp.q ?? ""} placeholder="Search by name or email" className="input" />
        <button className="btn-ghost text-sm"><Search className="h-4 w-4" aria-hidden /> Search</button>
      </form>

      <section className="card mt-block p-card" aria-label={meta.label}>
        <p className="text-sm text-slate-600">{meta.help}</p>
        {rows.length === 0 ? <p className="mt-lead text-sm text-slate-600">Nobody here{q ? " for that search" : " right now"}.</p> : (
          <form action={markDone}>
            <ul className="mt-lead divide-y divide-slate-200">
              {rows.map((p) => (
                <li key={p.userId} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                  <label className="flex min-w-0 flex-1 items-start gap-3">
                    {tab !== "done" && <input type="checkbox" name="id" value={p.userId} className="mt-1 h-5 w-5 flex-none accent-[#5A50D6]" aria-label={`Select ${p.name}`} />}
                    <span className="min-w-0">
                      <span className="block font-semibold text-slate-900">{p.name}</span>
                      <span className="block truncate text-sm text-slate-600">{p.email || "No email"}</span>
                      <span className="block text-xs text-slate-500">{tab === "done" ? (p.status === "member" ? "In the group" : "Removed or never joined") : "Waiting since"} · {day(p.since)}</span>
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2 sm:flex-none">
                    <CopyName name={p.name} />
                    {fb(p) && <a href={fb(p)!} target="_blank" rel="noopener noreferrer" className="btn-ghost px-3 py-1.5 text-xs">Open in Facebook <ExternalLink className="h-3.5 w-3.5" aria-hidden /></a>}
                    {tab !== "done" && <button name="one" value={p.userId} className="btn-primary px-3 py-1.5 text-xs">Mark done</button>}
                  </div>
                </li>
              ))}
            </ul>
            {tab !== "done" && <div className="mt-lead border-t border-slate-200 pt-4"><button className="btn-primary text-sm">Mark selected done</button></div>}
          </form>
        )}
      </section>
    </main>
  );
}
