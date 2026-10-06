import type { PlanId } from "./plans";
import { DAYS, STAGES, STAGE_TIER, dayTaskId, START_DAYS, START_STAGES, START_STAGE_TIER, startTaskId, type CurriculumDay, type Stage } from "./seed/curriculum";

export type TrackId = "starting" | "growing";
export type Track = {
  id: TrackId;
  name: string;
  short: string;
  who: string;
  covers: string[];
  days: CurriculumDay[];
  stages: Stage[];
  stageTier: Record<number, PlanId>;
  taskId: (d: number) => string;
};

export const TRACKS: Record<TrackId, Track> = {
  starting: {
    id: "starting",
    name: "Just starting",
    short: "For new founders with little or no sales yet.",
    who: "Pick this if you are launching, or you make only a few sales a month.",
    covers: [
      "Check your product and offer: who it is for, is there demand, and a price that leaves profit",
      "Get your store ready: a clear home page, product page basics, shipping info, email sign-up, tracking",
      "Run your first small test campaign with a budget you can afford and a clear stop rule",
      "Lighter lessons: 5 to 15 minutes a day, 21 days",
    ],
    days: START_DAYS,
    stages: START_STAGES,
    stageTier: START_STAGE_TIER,
    taskId: startTaskId,
  },
  growing: {
    id: "growing",
    name: "Growing",
    short: "For stores that already make regular sales.",
    who: "Pick this if you already sell every week and want more profit.",
    covers: [
      "Track profit every day and find what is holding it back",
      "Scale ads safely on Meta and Google while each sale stays profitable",
      "Bring customers back with email, SMS and better offers",
      "Plan Black Friday, Cyber Monday and the busy season",
      "64 days, about 10 to 20 minutes a day",
    ],
    days: DAYS,
    stages: STAGES,
    stageTier: STAGE_TIER,
    taskId: dayTaskId,
  },
};

export const toTrack = (v: unknown): TrackId => (v === "starting" ? "starting" : "growing");
export const track = (v: unknown): Track => TRACKS[toTrack(v)];

/** Any curriculum day by task id, across both tracks. */
export function dayByTaskId(id: string): { track: Track; day: CurriculumDay } | null {
  for (const t of Object.values(TRACKS)) {
    const day = t.days.find((d) => t.taskId(d.day) === id);
    if (day) return { track: t, day };
  }
  return null;
}
