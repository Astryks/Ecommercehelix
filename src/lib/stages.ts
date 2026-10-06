import map from "./stage-map.json";

/**
 * Attract, Convert, Grow: the three-stage framework every Helix lesson belongs to.
 * Attract gets the right buyers in, Convert turns visits into sales, Grow keeps more
 * of every sale and scales it. Module stages and lesson overrides live in stage-map.json.
 */
export type StageId = "attract" | "convert" | "grow";

export const STAGE_ORDER: StageId[] = ["attract", "convert", "grow"];

export const STAGE_INFO: Record<StageId, {
  name: string; step: number; tagline: string; blurb: string; covers: string[];
  chip: string; dot: string; panel: string; ink: string;
}> = {
  attract: {
    name: "Attract", step: 1, tagline: "Get seen by people who want what you sell.",
    blurb: "Ads, creative, content and audiences that bring the right buyers to your door, at a cost you can afford.",
    covers: ["Meta, Google and TikTok ads", "Creative, hooks and creators", "Content, social and SEO", "Audiences and campaign set-up"],
    chip: "bg-sky-50 text-sky-800 ring-sky-200", dot: "bg-sky-600", panel: "border-sky-200 bg-sky-50/60", ink: "text-sky-800",
  },
  convert: {
    name: "Convert", step: 2, tagline: "Turn visits into sales.",
    blurb: "An offer worth buying, a store that is easy to trust, a smooth checkout and emails that bring people back to finish.",
    covers: ["Offer, pricing and promotions", "Store, product pages and checkout", "Email and SMS flows", "Store set-up"],
    chip: "bg-orange-50 text-orange-800 ring-orange-200", dot: "bg-orange-600", panel: "border-orange-200 bg-orange-50/60", ink: "text-orange-800",
  },
  grow: {
    name: "Grow", step: 3, tagline: "Keep more of every sale, then scale.",
    blurb: "Profit every day, budgets that scale safely, customers who come back, and the stock, team and admin that hold it all up.",
    covers: ["Daily profit and the dashboard", "Scaling budgets and retention", "Stock, suppliers and cash", "Run your business and hiring"],
    chip: "bg-emerald-50 text-emerald-800 ring-emerald-200", dot: "bg-emerald-600", panel: "border-emerald-200 bg-emerald-50/60", ink: "text-emerald-800",
  },
};

const MODULES = map.modules as Record<string, StageId>;
const LESSONS = map.lessons as Record<string, StageId>;

export const toStage = (v: unknown): StageId | null => (v === "attract" || v === "convert" || v === "grow" ? v : null);

/** Primary stage of a playbook module (1 to 28). */
export function stageOfModule(n: number): StageId {
  return MODULES[String(n)] ?? "grow";
}

/** Stage of a lesson ref like "7.10" (its own tag, or its module's). */
export function stageOfLesson(ref: string): StageId {
  return LESSONS[ref] ?? stageOfModule(Number(ref.split(".")[0]));
}

/** Every module number tagged with a stage. */
export const TAGGED_MODULES = Object.keys(MODULES).map(Number).sort((a, b) => a - b);
