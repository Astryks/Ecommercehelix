import Link from "next/link";
import { KLAVIYO_SCOPES } from "@/lib/klaviyo/config";
import { KlaviyoExplainer } from "@/app/dashboard/integrations/more2";

export const metadata = { title: "Klaviyo and Helix" };

export default function KlaviyoHelp() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/learn" className="text-sm text-cyan-700 underline">Back to Learn</Link>
      <h1 className="mt-3 text-3xl font-semibold">Klaviyo and Helix</h1>
      <p className="mt-2 text-slate-600">Automatic emails are one of the cheapest ways to get more sales from people who already visited your store. Connect Klaviyo and Helix shows you which ones are working.</p>
      <KlaviyoExplainer />
      <section className="card mt-6 p-6 text-sm text-slate-700">
        <h2 className="text-lg font-semibold text-slate-900">The 3 emails every store should have on</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><b>Welcome:</b> sent when someone joins your list. Say hello and give a reason to buy.</li>
          <li><b>Abandoned cart:</b> sent when someone leaves items in their cart. Usually the one that makes the most money.</li>
          <li><b>Post-purchase:</b> sent after an order. Say thanks, ask for a review, suggest a next product.</li>
        </ul>
        <h2 className="mt-5 text-lg font-semibold text-slate-900">Key access to pick in Klaviyo</h2>
        <p className="mt-1">Read access only: {KLAVIYO_SCOPES.join(", ")}. Everything else: No access.</p>
        <h2 className="mt-5 text-lg font-semibold text-slate-900">Turn it off</h2>
        <p className="mt-1">On Integrations, press Revoke and delete. Helix deletes your key and every Klaviyo number. You can also delete the key inside Klaviyo.</p>
        <Link href="/dashboard/integrations#klaviyo" className="btn-primary mt-5 text-sm">Connect Klaviyo</Link>
      </section>
    </div>
  );
}
