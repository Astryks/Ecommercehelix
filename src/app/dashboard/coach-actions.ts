"use server";

import { requireUser } from "@/lib/session";
import { coachEnabled, MAX_QUESTION_CHARS } from "@/lib/coach/config";
import { askCoach, openCoach, type CoachOpen } from "@/lib/coach/server";
import type { CoachAnswer } from "@/lib/coach/engine";
import { cleanFact, MEMORY_KINDS } from "@/lib/coach/memory";
import { deleteFact, editFact, getFacts, saveFacts, tickTask } from "@/lib/coach/store";
import { overLimit } from "@/lib/limits";

function on() {
  if (!coachEnabled()) throw new Error("Coach is off");
}

export async function coachOpen(): Promise<CoachOpen> {
  on();
  const u = await requireUser("/dashboard");
  return openCoach(u.id);
}

export async function coachAsk(question: string, deepDive: boolean): Promise<CoachAnswer> {
  on();
  const u = await requireUser("/dashboard");
  const q = String(question ?? "").trim().slice(0, MAX_QUESTION_CHARS);
  if (q.length < 2) return { text: "Type a question and I'll help.", mode: "general", modeLabel: "General", tier: null, why: null, model: null, links: [], left: 0, deepLeft: 0, limited: "error" };
  if (await overLimit(`coach:${u.id}`, 6, 60_000)) return { text: "That's a lot of questions at once. Give me a minute, then ask again.", mode: "general", modeLabel: "General", tier: null, why: null, model: null, links: [], left: 0, deepLeft: 0, limited: "cap" };
  return askCoach(u.id, q, Boolean(deepDive));
}

export async function coachTick(id: string, done: boolean) {
  on();
  const u = await requireUser("/dashboard");
  await tickTask(u.id, String(id), Boolean(done));
}

export async function coachMemoryEdit(id: string, fact: string) {
  on();
  const u = await requireUser("/dashboard");
  const f = cleanFact({ kind: "business", fact });
  if (f) await editFact(u.id, String(id), f.fact);
  return getFacts(u.id);
}

export async function coachMemoryAdd(kind: string, fact: string) {
  on();
  const u = await requireUser("/dashboard");
  const f = cleanFact({ kind: (MEMORY_KINDS as readonly string[]).includes(kind) ? kind : "business", fact });
  if (f) await saveFacts(u.id, [f], [], "user");
  return getFacts(u.id);
}

export async function coachMemoryDelete(id: string) {
  on();
  const u = await requireUser("/dashboard");
  await deleteFact(u.id, id === "all" ? "all" : String(id));
  return getFacts(u.id);
}
