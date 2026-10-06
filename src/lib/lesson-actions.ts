/**
 * "Do it for me" actions attached to playbook lessons and steps with an
 * <!-- do:KEY --> comment. Client-safe (no server imports).
 *  - link: Helix already does this in a tool, so the button opens it.
 *  - delegate: maps to an existing actionable (Meta paused draft, email flow) that goes to approvals.
 *  - request: anything else becomes a done-for-you request in "Waiting for your OK".
 */
export type LessonAction =
  | { kind: "link"; key: string; href: string; label: string }
  | { kind: "delegate"; key: string; actionableId: string; label: string }
  | { kind: "request"; key: "request"; label: string };

const LINKS: Record<string, { href: string; label: string }> = {
  "meta-connect": { href: "/dashboard/integrations", label: "Connect Meta to Helix" },
  numbers: { href: "/dashboard/scorecard#entry", label: "Enter your numbers" },
  growth: { href: "/dashboard/growth", label: "Open your growth dashboard" },
  metrics: { href: "/dashboard/metrics", label: "Open your key metrics" },
  goals: { href: "/dashboard/goals", label: "Open your monthly goals" },
  stock: { href: "/dashboard/stock", label: "Open suppliers and stock" },
  calendar: { href: "/dashboard/calendar", label: "Add it to your calendar" },
  bfcm: { href: "/dashboard/calendar", label: "Open your sale prep plan" },
  insights: { href: "/dashboard/insights", label: "See what Helix found" },
  settings: { href: "/dashboard/settings", label: "Open settings" },
};

const FLOW_IDS = ["welcome", "abandoned-checkout", "abandoned-cart", "browse-abandonment", "post-purchase", "review-request", "replenishment", "win-back", "vip"];

export function lessonAction(key: string | null | undefined): LessonAction {
  if (key && LINKS[key]) return { kind: "link", key, ...LINKS[key] };
  if (key === "meta-draft") return { kind: "delegate", key, actionableId: "build-meta-campaign", label: "Build it in Meta as a paused draft" };
  if (key?.startsWith("flow-") && FLOW_IDS.includes(key.slice(5))) return { kind: "delegate", key, actionableId: key, label: "Set up this email flow for me" };
  return { kind: "request", key: "request", label: "Do it for me" };
}

export const KNOWN_ACTION_KEYS = [...Object.keys(LINKS), "meta-draft", ...FLOW_IDS.map((f) => `flow-${f}`)];

/** Task ids for lessons and steps: lesson-7-1 and lesson-7-1-s3. */
export const LESSON_TASK_ID = /^lesson-(\d{1,2})-(\d{1,2})(?:-s(\d{1,2}))?$/;
export const lessonTaskId = (ref: string, step?: number) => `lesson-${ref.replace(".", "-")}${step ? `-s${step}` : ""}`;
export function parseLessonTaskId(id: string): { ref: string; step: number | null } | null {
  const m = id.match(LESSON_TASK_ID);
  return m ? { ref: `${Number(m[1])}.${Number(m[2])}`, step: m[3] ? Number(m[3]) : null } : null;
}

/** Progress keys stored per user: "7.1#3" for step 3 of lesson 7.1. */
export const STEP_KEY = /^\d{1,2}\.\d{1,2}#\d{1,2}$/;
export const stepKey = (ref: string, n: number) => `${ref}#${n}`;
