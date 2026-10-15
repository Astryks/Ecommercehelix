import { requireUser } from "@/lib/session";
import { getAccount } from "@/lib/repo";
import { addReviewRequest } from "@/lib/community";
import { redirect } from "next/navigation";
import { LostLink } from "@/components/dashboard/LostLink";

export const metadata = { title: "Review my store" };

async function send(form: FormData) {
  "use server";
  const u = await requireUser("/dashboard/review");
  const acct = await getAccount(u.id);
  const storeUrl = String(form.get("store") ?? acct.storeUrl ?? "").trim().slice(0, 200);
  const question = String(form.get("question") ?? "").trim().slice(0, 1500);
  if (!storeUrl) redirect("/dashboard/review?err=store");
  const ok = await addReviewRequest(u.id, acct.email, storeUrl, question);
  redirect(ok ? "/dashboard/review?sent=1" : "/dashboard/review?err=limit");
}

export default async function ReviewPage({ searchParams }: PageProps<"/dashboard/review">) {
  const sp = await searchParams;
  const u = await requireUser("/dashboard/review");
  const acct = await getAccount(u.id);
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Review my store</h1>
      <p className="mt-1 text-slate-700">Want a person to look at your store? Tell us what to look at. We reply by email, usually within a few business days.</p>
      {sp.sent && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">Sent. We will email you at {acct.email}.</p>}
      {sp.err === "limit" && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">You have sent two requests this week. We will get to them soon.</p>}
      <form action={send} className="card mt-5 space-y-4 p-5">
        <div className="flex items-baseline justify-between"><h2 className="font-hand text-xl text-cyan-700">Your request</h2><LostLink about="Asking for a store review" /></div>
        <label className="block text-sm font-semibold text-slate-800">Your store address
          <input name="store" defaultValue={acct.storeUrl ?? ""} required maxLength={200} className="input mt-1" placeholder="yourstore.com" />
        </label>
        <label className="block text-sm font-semibold text-slate-800">What should we look at? (one or two lines is fine)
          <textarea name="question" rows={4} maxLength={1500} className="input mt-1" placeholder="e.g. People add to cart but don't buy." />
        </label>
        <button className="btn-primary text-sm">Send my request</button>
        <p className="text-xs text-slate-500">This goes to the Helix team. It is general feedback on your store, not a promise of results.</p>
      </form>
    </div>
  );
}
