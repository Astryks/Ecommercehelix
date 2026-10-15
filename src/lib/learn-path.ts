import data from "./learn-path.json";

/** One clear guided path through every lesson. Attract / Convert / Grow stay as small tags only. */
export type PathVideo = { title: string; channel: string; url: string };
export type PathStep = { n: number; id: string; title: string; blurb: string; refs: string[]; videos: PathVideo[] };

export const PATH: PathStep[] = data.steps;

export const pathStepOf = (ref: string) => PATH.find((s) => s.refs.includes(ref));
export const pathStepById = (id: string) => PATH.find((s) => s.id === id);

/** Shown at the top of "Set up your first ad", before any lesson. */
export const FIRST_AD_BEFORE = [
  "Your store is live and you placed a test order (step 3).",
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
