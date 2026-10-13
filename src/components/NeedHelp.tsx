import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import { SUPPORT_EMAIL, supportMailto } from "@/lib/support";

/** A small, always-visible way to reach a person, plus the step-by-step help guides. */
export function NeedHelp({ topic, guidesHref = "/help", dark = false, className = "" }: { topic?: string; guidesHref?: string; dark?: boolean; className?: string }) {
  return (
    <div className={`rounded-xl p-3 text-xs ${dark ? "bg-white/5 text-slate-300" : "border border-slate-200 bg-white text-slate-600"} ${className}`}>
      <p className={`flex items-center gap-1.5 font-semibold ${dark ? "text-white" : "text-slate-900"}`}><LifeBuoy className="h-3.5 w-3.5" aria-hidden /> Need help?</p>
      <p className="mt-1">
        <Link href={guidesHref} className="underline">Step-by-step guides</Link> or email{" "}
        <a href={supportMailto(topic)} className="break-all underline">{SUPPORT_EMAIL}</a>. A real person replies, usually within one business day.
      </p>
    </div>
  );
}
