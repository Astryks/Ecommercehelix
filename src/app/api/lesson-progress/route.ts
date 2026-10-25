import { type NextRequest } from "next/server";
import { auth } from "@/auth";
import { completeTask, ensureUser, getLessonSteps, setLessonStep } from "@/lib/repo";
import { STEP_KEY, lessonTaskId, stepKey } from "@/lib/lesson-actions";
import { findLesson } from "@/lib/learn";
import { toCurrentStepKeys } from "@/lib/lesson-alias";
import { createHash } from "node:crypto";

export const dynamic = "force-dynamic";

async function userId() {
  const s = await auth();
  if (!s?.user?.id) return null;
  return ensureUser(s.user.id, s.user.email ?? "", s.user.name ?? "");
}

/** Ticked lesson steps for the signed-in user. Signed-out visitors keep progress in the browser only. */
export async function GET() {
  const id = await userId();
  if (!id) return Response.json({ signedIn: false, done: [] });
  // A short hash (not the id) so each user gets their own local copy in the browser.
  const user = createHash("sha256").update(String(id)).digest("hex").slice(0, 16);
  return Response.json({ signedIn: true, user, done: await getLessonSteps(id) });
}

/**
 * Body: { keys: string[], done: boolean, v?: 2 }. Up to 50 step keys like "8.2#3" at once (so local progress can be merged on sign-in).
 * v: 2 means current lesson numbers. Without it (a page loaded before the 26 Oct 2026 reorder) keys are the old numbers,
 * which are the permanent ids progress is saved under.
 */
export async function POST(req: NextRequest) {
  const id = await userId();
  if (!id) return Response.json({ ok: false, signedIn: false }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { keys?: unknown; done?: unknown; v?: unknown } | null;
  const raw = Array.isArray(body?.keys) ? body.keys.filter((k): k is string => typeof k === "string" && STEP_KEY.test(k)).slice(0, 50) : [];
  if (!raw.length) return Response.json({ ok: false }, { status: 400 });
  const stored = body?.v !== 2;
  for (const k of raw) await setLessonStep(id, k, body?.done !== false, stored);
  const keys = stored ? toCurrentStepKeys(raw) : raw;
  // When every step of a lesson is ticked, count the lesson as done (Learn, Today and streaks use this).
  if (body?.done !== false) {
    const all = new Set(await getLessonSteps(id));
    for (const ref of new Set(keys.map((k) => k.split("#")[0]))) {
      const ns = findLesson(ref)?.steps.map((s) => s.n) ?? [];
      if (ns.length && ns.every((n) => all.has(stepKey(ref, n)))) await completeTask(id, lessonTaskId(ref));
    }
  }
  return Response.json({ ok: true });
}
