import "server-only";
import { getDiagnosis, getProfitSetup, getRawDays, type DiagnosisRow } from "./repo";
import { auditRuns, type AuditRunRow } from "./site-audit/run";
import { buildPlan, currentBlock, totalWeeks, weekOf, type Block } from "./plan12";
import { lessonLink } from "./lesson-links";
import { isoDay } from "./dates";

export type PlanState = { diag: DiagnosisRow; plan: Block[]; week: number; total: number; current: Block; run: AuditRunRow | null };

export const blockHref = (b: Block) => (b.href.startsWith("lesson:") ? lessonLink(b.href.slice(7))?.href ?? "/learn" : b.href);

export async function planState(userId: string): Promise<PlanState | null> {
  const diag = await getDiagnosis(userId);
  if (!diag) return null;
  const [profit, days, runs] = await Promise.all([getProfitSetup(userId), getRawDays(userId), auditRuns(userId, 1)]);
  const plan = buildPlan(diag.diagnosis);
  const total = totalWeeks(plan);
  const week = weekOf(diag.planStartedAt ?? diag.diagnosedAt, isoDay(), total);
  const run = runs[0] ?? null;
  const fixesDone = Boolean(run?.ok && !run.findings.some((f) => f.severity === "high"));
  const current = currentBlock(plan, week, { profitSaved: Boolean(profit), numbersSaved: days.some((d) => !d.example), fixesDone });
  return { diag, plan, week, total, current, run };
}
