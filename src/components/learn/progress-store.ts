"use client";

import { useSyncExternalStore } from "react";

/**
 * Ticked lesson steps. Kept in localStorage for everyone and synced to the
 * server for signed-in users (/api/lesson-progress), so progress follows them
 * between devices. Local ticks made before signing in are merged up once.
 */
const LS = "helix-lesson-steps";
let done = new Set<string>();
let signedIn = false;
let loaded = false;
const subs = new Set<() => void>();
let snapshot = { done, signedIn, loaded };

function emit() {
  snapshot = { done, signedIn, loaded };
  subs.forEach((f) => f());
}

function save() {
  try { localStorage.setItem(LS, JSON.stringify([...done])); } catch { /* private mode */ }
}

async function post(keys: string[], value: boolean) {
  for (let i = 0; i < keys.length; i += 50) {
    await fetch("/api/lesson-progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keys: keys.slice(i, i + 50), done: value }) }).catch(() => null);
  }
}

let started = false;
function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  try { done = new Set(JSON.parse(localStorage.getItem(LS) ?? "[]") as string[]); } catch { done = new Set(); }
  loaded = true;
  emit();
  fetch("/api/lesson-progress", { cache: "no-store" })
    .then((r) => r.json() as Promise<{ signedIn: boolean; done: string[] }>)
    .then((r) => {
      signedIn = r.signedIn;
      if (!r.signedIn) return emit();
      const server = new Set(r.done);
      const localOnly = [...done].filter((k) => !server.has(k));
      done = new Set([...server, ...done]);
      save();
      emit();
      if (localOnly.length) void post(localOnly, true);
    })
    .catch(() => emit());
}

export function toggleStep(key: string, value: boolean) {
  done = new Set(done);
  if (value) done.add(key);
  else done.delete(key);
  save();
  emit();
  if (signedIn) void post([key], value);
}

const server = { done: new Set<string>(), signedIn: false, loaded: false };

export function useLessonProgress() {
  return useSyncExternalStore(
    (cb) => { subs.add(cb); start(); return () => subs.delete(cb); },
    () => snapshot,
    () => server,
  );
}
