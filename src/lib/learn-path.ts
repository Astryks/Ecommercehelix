import data from "./learn-path.json";

import type { StageId } from "./stages";

/** One guided path through every lesson, in stage order: Start here, then Attract, Convert, Grow.
 * Each lesson keeps its own stage tag. A step with a `label` (step 2) sits in Attract but holds
 * Convert lessons you must do before any ad. */
export type PathVideo = { title: string; channel: string; url: string };
export type PathStage = "start" | StageId;
export type PathStep = { n: number; id: string; stage: PathStage; label?: string; title: string; blurb: string; refs: string[]; videos: PathVideo[] };

export const PATH: PathStep[] = data.steps as PathStep[];

/** The Convert-before-ads rule, shown on the stage strip, the framework page and step 2. */
export const CONVERT_BEFORE_ADS = "Store layout and checkout are Convert jobs, but you do the basics before your first ad. Ads only send people; the store has to be ready to sell.";

export const PATH_STAGE_NAME: Record<PathStage, string> = { start: "Start here", attract: "Attract", convert: "Convert", grow: "Grow" };

export const pathStepOf = (ref: string) => PATH.find((s) => s.refs.includes(ref));
export const pathStepById = (id: string) => PATH.find((s) => s.id === id);

/** Shown at the top of "Set up your first ad", before any lesson. */
export const FIRST_AD_BEFORE = [
  "Your store is live and you placed a test order (step 2).",
  "You know your break-even ROAS and daily budget (step 1).",
  "You have a Meta Business account, a Facebook Page and an Instagram account.",
  "A card is ready to pay for ads. Start with an amount you can afford to lose.",
  "You have 3 ads ready: 1 video and 2 photos (step 4).",
];
export const FIRST_AD_ORDER = [
  "Turn on tracking (pixel) and check it sees a purchase.",
  "Set up your Meta business the safe way.",
  "Tick off the ad account checklist.",
  "Learn where things are in Ads Manager.",
  "Launch your first Meta sales ad.",
  "Leave it alone for the learning phase.",
  "Next: Google, then TikTok, when Meta runs well.",
];
