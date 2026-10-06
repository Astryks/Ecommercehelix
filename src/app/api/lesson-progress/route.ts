import { type NextRequest } from "next/server";
import { auth } from "@/auth";
import { ensureUser, getLessonSteps, setLessonStep } from "@/lib/repo";
import { STEP_KEY } from "@/lib/lesson-actions";

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
  return Response.json({ signedIn: true, done: await getLessonSteps(id) });
}

/** Body: { keys: string[], done: boolean }. Up to 50 step keys like "7.1#3" at once (so local progress can be merged on sign-in). */
export async function POST(req: NextRequest) {
  const id = await userId();
  if (!id) return Response.json({ ok: false, signedIn: false }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { keys?: unknown; done?: unknown } | null;
  const keys = Array.isArray(body?.keys) ? body.keys.filter((k): k is string => typeof k === "string" && STEP_KEY.test(k)).slice(0, 50) : [];
  if (!keys.length) return Response.json({ ok: false }, { status: 400 });
  for (const k of keys) await setLessonStep(id, k, body?.done !== false);
  return Response.json({ ok: true });
}
