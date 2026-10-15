/**
 * When is a lesson done? Either it was marked done (a task completion), or every
 * one of its steps is ticked. Ticking all steps with "Finish lesson" only saves
 * step ticks, so both must count. Pure and client-safe.
 */
import { lessonTaskId, stepKey } from "./lesson-actions";

export type LessonState = "done" | "started" | "new";

export function lessonStateFn(taskIds: Iterable<string>, stepKeys: Iterable<string>) {
  const done = new Set(taskIds);
  const steps = new Set(stepKeys);
  const started = new Set([...steps].map((k) => k.split("#")[0]));
  return (ref: string, stepNs: number[] = []): LessonState => {
    if (done.has(lessonTaskId(ref))) return "done";
    if (stepNs.length && stepNs.every((n) => steps.has(stepKey(ref, n)))) return "done";
    return started.has(ref) ? "started" : "new";
  };
}
