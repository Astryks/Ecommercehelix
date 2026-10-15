import { HelpGuides } from "@/components/HelpGuides";
import { AiBox } from "@/components/AiBox";
import { aiHelp } from "../ai-actions";
import Link from "next/link";

export default async function DashboardHelp({ searchParams }: PageProps<"/dashboard/help">) {
  const sp = await searchParams;
  const about = typeof sp.about === "string" ? sp.about.slice(0, 120) : "";
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="page-title">Help</h1>
      <p className="page-lead">Where Helix cannot do a step for you, here is exactly how to do it. Still stuck? <Link className="underline" href="/dashboard/contact">Contact us</Link>. A real person replies, usually within one business day.</p>
      <section className="card mt-6 p-5">
        <h2 className="font-semibold">I&apos;m lost</h2>
        <p className="mt-1 text-sm text-slate-600">Tell Helix where you are stuck and it points you to the next step.</p>
        <div className="mt-3"><AiBox action={aiHelp} label="Help me" question placeholder="e.g. I don't know where to start with ads" defaultValue={about ? `I'm lost on: ${about}` : undefined} /></div>
      </section>
      <div className="mt-6"><HelpGuides /></div>
    </div>
  );
}
