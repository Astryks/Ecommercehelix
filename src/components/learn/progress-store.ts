"use client";

import { useSyncExternalStore } from "react";

/**
 * Ticked lesson steps. Kept in localStorage and synced to the server for
 * signed-in users (/api/lesson-progress), so progress follows them between
 * devices. Guest ticks are merged into the account once, then cleared, so the
 * next person who signs in on this browser does not get them. Each signed-in
 * user has their own local copy.
 */
const GUEST = "helix-lesson-steps";
let key = GUEST;
let done = new Set<string>();
let signedIn = false;
let loaded = false;
let syncError = false;
/** Changes made before we knew who is signed in, applied after the server merge. */
let early = new Map<string, boolean>();
/** Changes the server has not accepted yet; retried on the next change or load. */
const unsent = new Map<string, boolean>();
const subs = new Set<() => void>();
let snapshot = { done, signedIn, loaded, syncError };

function emit() {
  snapshot = { done, signedIn, loaded, syncError };
  subs.forEach((f) => f());
}

const read = (k: string): string[] => { try { return JSON.parse(localStorage.getItem(k) ?? "[]") as string[]; } catch { return []; } };
function save() {
  try { localStorage.setItem(key, JSON.stringify([...done])); } catch { /* private mode */ }
}

async function send(keys: string[], value: boolean): Promise<boolean> {
  let ok = true;
  for (let i = 0; i < keys.length; i += 50) {
    const r = await fetch("/api/lesson-progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keys: keys.slice(i, i + 50), done: value }) }).catch(() => null);
    if (!r?.ok) ok = false;
  }
  return ok;
}

/** Send every unsent change; flag an error so the page can say progress is only on this device. */
async function flush() {
  if (!signedIn || !unsent.size) return;
  const batch = new Map(unsent);
  const on = [...batch].filter(([, v]) => v).map(([k]) => k);
  const off = [...batch].filter(([, v]) => !v).map(([k]) => k);
  const ok = (on.length ? await send(on, true) : true) && (off.length ? await send(off, false) : true);
  if (ok) for (const [k, v] of batch) if (unsent.get(k) === v) unsent.delete(k);
  if (syncError !== !ok) { syncError = !ok; emit(); }
}

/** Pure merge used on sign-in, exported for tests. */
export function mergeProgress(server: string[], local: string[], earlyChanges: Map<string, boolean>) {
  const out = new Set([...server, ...local]);
  for (const [k, v] of earlyChanges) { if (v) out.add(k); else out.delete(k); }
  const s = new Set(server);
  const toAdd = [...out].filter((k) => !s.has(k));
  const toRemove = [...earlyChanges].filter(([k, v]) => !v && s.has(k)).map(([k]) => k);
  return { done: out, toAdd, toRemove };
}

let started = false;
function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  done = new Set(read(GUEST));
  loaded = true;
  emit();
  fetch("/api/lesson-progress", { cache: "no-store" })
    .then((r) => r.json() as Promise<{ signedIn: boolean; done: string[]; user?: string }>)
    .then((r) => {
      signedIn = r.signedIn;
      if (!r.signedIn) { early = new Map(); return emit(); }
      key = r.user ? `${GUEST}:${r.user}` : GUEST;
      const m = mergeProgress(r.done, [...read(GUEST), ...(key === GUEST ? [] : read(key))], early);
      early = new Map();
      done = m.done;
      if (key !== GUEST) { try { localStorage.removeItem(GUEST); } catch { /* ignore */ } }
      save();
      emit();
      for (const k of m.toAdd) unsent.set(k, true);
      for (const k of m.toRemove) unsent.set(k, false);
      void flush();
    })
    .catch(() => { early = new Map(); emit(); });
}

export function toggleStep(k: string, value: boolean) {
  done = new Set(done);
  if (value) done.add(k);
  else done.delete(k);
  save();
  emit();
  if (signedIn) { unsent.set(k, value); void flush(); }
  else early.set(k, value);
}

const server = { done: new Set<string>(), signedIn: false, loaded: false, syncError: false };

export function useLessonProgress() {
  return useSyncExternalStore(
    (cb) => { subs.add(cb); start(); return () => subs.delete(cb); },
    () => snapshot,
    () => server,
  );
}
