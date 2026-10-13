import { HelpGuides } from "@/components/HelpGuides";
import { SUPPORT_EMAIL, supportMailto } from "@/lib/support";

export default function DashboardHelp() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">Help</h1>
      <p className="mt-2 text-slate-700">Where Helix cannot do a step for you, here is exactly how to do it. Still stuck? Email <a className="underline" href={supportMailto()}>{SUPPORT_EMAIL}</a>. A real person replies, usually within one business day.</p>
      <div className="mt-6"><HelpGuides /></div>
    </div>
  );
}
