import { requireUser } from "@/lib/session";
import { computeTools } from "@/lib/tools/server";
import { ToolPage, Table } from "@/components/tools/ToolPage";

export const metadata = { title: "My targets" };

export default async function Targets() {
  const u = await requireUser("/dashboard/numbers/targets");
  const t = await computeTools(u.id);
  const f = (v: number | null, unit: string) => (v === null ? "–" : unit === "$" ? `$${Math.round(v)}` : `${v}%`);
  return (
    <ToolPage title="My targets" intro="Your next target, not a perfect one. Each number shows where you are, the next step and a stretch goal." auto="every day as your numbers change" example={t.example} lesson={{ label: "Set monthly goals", href: "/dashboard/goals" }}>
      <div data-testid="tool-targets">
        <Table head={["Number", "Now (30 days)", "Next target", "Stretch", "Gap to next"]} rows={t.targets.map((x) => [x.name, f(x.current, x.unit), f(x.next, x.unit), f(x.stretch, x.unit), x.gapToNext === null ? "Add data" : `${x.gapToNext > 0 ? "+" : ""}${x.unit === "$" ? "$" : ""}${x.gapToNext}${x.unit === "%" ? " pts" : ""}`])} />
      </div>
      <p className="text-xs text-slate-500">Stretch goals come from Helix&apos;s general guides (rules of thumb, not survey data). Next targets move up as you hit them.</p>
    </ToolPage>
  );
}
