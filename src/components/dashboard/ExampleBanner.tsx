import Link from "next/link";
import { getRawDays } from "@/lib/repo";
import { clearExamples } from "@/app/dashboard/actions";

/** New accounts start with example numbers so the charts make sense. Say so clearly, everywhere. */
export async function ExampleBanner({ userId }: { userId: string }) {
  const days = await getRawDays(userId).catch(() => []);
  const examples = days.filter((d) => d.example).length;
  if (!examples) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900" role="status">
      <span><strong>You are looking at example numbers</strong>, not your store. Add your own in <Link href="/dashboard/scorecard" className="underline">Your numbers</Link>, then clear the examples.</span>
      <form action={clearExamples}><button className="rounded-full border border-amber-300 bg-white px-2.5 py-0.5 font-semibold hover:bg-amber-100">Clear examples</button></form>
    </div>
  );
}
