import Link from "next/link";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Unsubscribe", robots: { index: false } };

const NAMES: Record<string, string> = { daily: "the daily steps email", event: "big sale date emails", winback: "the come-back email", scorecard: "the Monday scorecard", all: "all Helix tips and updates" };

export default async function Unsub({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const k = NAMES[sp.k ?? "all"] ? sp.k ?? "all" : "all";
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5 py-16">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8">
        <Link href="/"><Logo /></Link>
        {sp.done ? (
          <>
            <h1 className="mt-6 text-2xl font-bold">{sp.done === "1" ? "You are unsubscribed" : "That link has expired"}</h1>
            <p className="mt-2 text-slate-700">{sp.done === "1" ? `We will not send ${NAMES[k]} again. Account emails like receipts still come.` : "Change your emails in Settings instead."}</p>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-2xl font-bold">Unsubscribe?</h1>
            <p className="mt-2 text-slate-700">Stop {NAMES[k]}. One click.</p>
            <form method="post" action={`/api/email/unsubscribe?t=${encodeURIComponent(sp.t ?? "")}&k=${k}`} className="mt-4"><button className="btn-primary">Yes, unsubscribe</button></form>
          </>
        )}
        <p className="mt-6 text-sm"><Link href="/dashboard/settings/emails" className="text-cyan-700 underline">Choose your emails in Settings</Link></p>
      </div>
    </main>
  );
}
