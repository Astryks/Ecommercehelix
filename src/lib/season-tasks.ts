/**
 * Seasonal tasks on Today, worked out from the seasonal calendar.
 * One timeline for every event (a guide, not exact):
 *   10 to 7 weeks out: plan the offer and order stock
 *   6 to 4 weeks out: line up creators
 *   3 weeks to 15 days out: set up discount codes (Do it for me drafts one, paused)
 *   2 weeks to 1 day out: dress the store, warm up, write emails
 *   during: check numbers each day
 *   1 to 7 days after: review the results
 */
import { daysFrom, eventsForCountry, type CalEvent } from "./season-calendar";

export type StageId = "plan" | "creators" | "codes" | "dress" | "live" | "review";
type Window = { from: number; to: number }; // days before the start (from >= to); negative = after the end

export const STAGE_WINDOWS: Record<Exclude<StageId, "live" | "review">, Window> = {
  plan: { from: 70, to: 43 },
  creators: { from: 42, to: 22 },
  codes: { from: 21, to: 15 },
  dress: { from: 14, to: 1 },
};
export const REVIEW_DAYS = 7;
const ORDER: StageId[] = ["plan", "creators", "codes", "dress", "live", "review"];

const M = "30-seasonal-sales-step-by-step";
const LESSON: Record<StageId, string> = {
  plan: `/learn/${M}#lesson-301-plan-your-offer-and-order-stock`,
  creators: `/learn/${M}#lesson-302-line-up-creators`,
  codes: `/learn/${M}#lesson-303-set-up-a-discount-code-in-shopify`,
  dress: `/learn/${M}#lesson-304-dress-your-store-warm-up-and-write-your-emails`,
  live: `/learn/${M}#lesson-305-run-the-event-check-your-numbers-each-day`,
  review: `/learn/${M}#lesson-306-review-the-results`,
};

/** What Helix knows about the store, used to make steps specific. All optional. */
export type StoreCtx = { profitPerOrder?: number; price?: number; dailyUnits?: number; storeUrl?: string | null };

export type SeasonTask = {
  taskId: string; // season-<event>-<year>-<stage>
  eventKey: string;
  eventName: string;
  year: number;
  stage: StageId;
  title: string;
  why: string;
  steps: string[];
  guideHref: string;
  catchUp: boolean;
  /** Days to the event start (negative once it has started). */
  daysTo: number;
};

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

/** A safe discount: under half the profit on one order, rounded down to 5%, between 5% and 30%. */
export function safeDiscountPct(ctx: StoreCtx): number {
  if (!ctx.profitPerOrder || !ctx.price || ctx.price <= 0) return 15;
  const pct = Math.floor(((ctx.profitPerOrder / ctx.price) * 100 * 0.5) / 5) * 5;
  return Math.max(5, Math.min(30, pct));
}

export function promoCode(ev: CalEvent, year: number): string {
  return (ev.key.replace(/-/g, "").toUpperCase().slice(0, 6) + String(year).slice(2)).replace(/[^A-Z0-9]/g, "");
}

function stageTask(ev: CalEvent, year: number, stage: StageId, start: string, end: string, today: string, ctx: StoreCtx, catchUp: boolean): SeasonTask {
  const n = ev.name;
  const pct = safeDiscountPct(ctx);
  const code = promoCode(ev, year);
  const eventDays = daysFrom(start, end) + 1;
  const stock = ctx.dailyUnits ? Math.ceil(ctx.dailyUnits * 3 * eventDays) : null;
  const T: Record<StageId, { title: string; why: string; steps: string[] }> = {
    plan: {
      title: `Plan your ${n} offer and order stock`,
      why: "Stock takes weeks to arrive. Deciding early keeps your profit safe.",
      steps: [
        ctx.profitPerOrder ? `You make about ${money(ctx.profitPerOrder)} profit on one order before ads. Keep your discount under half of that: about ${pct}% or less.` : "Open Profit setup and find your profit on one order. Keep any discount under half of it.",
        "Pick one simple offer: a small discount, a free gift or a bundle.",
        stock ? `Order stock now. Plan for about ${stock} units of your best sellers for the ${eventDays}-day event (three times a normal day).` : "Order stock now. Plan for about three times a normal day's sales on each event day.",
      ],
    },
    creators: {
      title: `Line up creators for ${n}`,
      why: "A trusted person showing your product warms up new buyers before the big day.",
      steps: [
        "List 10 small creators in your niche (2,000 to 50,000 followers).",
        "Send each the 'Message to a creator' template from the template library.",
        "Gift the product to those who say yes, with their own code and a share of each sale.",
      ],
    },
    codes: {
      title: `Set up your ${n} discount code`,
      why: "A code that is ready and tested means no rush on the day.",
      steps: [
        `Suggested code: ${code} for ${pct}% off, from ${start} to ${end}.`,
        "In Shopify: Discounts, then Create discount, then Amount off orders.",
        "Type the code, set Percentage, set the start and end dates, then Save.",
        "Place a test order to check it works.",
      ],
    },
    dress: {
      title: `Dress your store for ${n} and write your emails`,
      why: "When the store looks ready, every visit has a clear path to buy.",
      steps: [
        "Add a homepage banner and an announcement bar with the offer and end date.",
        "Make one event collection and a short gift guide.",
        "Post about the sale and invite people to join your email list for early access.",
        "Write and schedule three emails: starts tomorrow, it's on, last day.",
      ],
    },
    live: {
      title: `${n} is on: check your numbers`,
      why: "A five-minute check each morning catches problems early.",
      steps: ["Open Numbers and tap yesterday.", "Compare ROAS with break-even ROAS.", "Check stock on best sellers and reply to messages."],
    },
    review: {
      title: `Review your ${n} results`,
      why: "Next year's plan is easiest to write while you still remember this one.",
      steps: ["Add up the event days in Numbers: sales, orders, ad spend and profit.", "Write three things that worked and three to change.", "Send buyers a thank-you email."],
    },
  };
  return { taskId: `season-${ev.key}-${year}-${stage}`, eventKey: ev.key, eventName: n, year, stage, guideHref: LESSON[stage], catchUp, daysTo: daysFrom(today, start), ...T[stage] };
}

/** The stage a date falls in for an event, or null outside the timeline. */
export function stageAt(today: string, start: string, end: string): StageId | null {
  if (today >= start && today <= end) return "live";
  if (today > end) return daysFrom(end, today) <= REVIEW_DAYS ? "review" : null;
  const d = daysFrom(today, start);
  for (const s of ["plan", "creators", "codes", "dress"] as const) if (d <= STAGE_WINDOWS[s].from && d >= STAGE_WINDOWS[s].to) return s;
  return null;
}

/** The event whose timeline today falls in: running first, then the most important, then the soonest. */
export function timelineEvent(today: string, country: string): { ev: CalEvent; year: number; start: string; end: string; stage: StageId } | null {
  const y = Number(today.slice(0, 4));
  const hits: { ev: CalEvent; year: number; start: string; end: string; stage: StageId }[] = [];
  for (const ev of eventsForCountry(country)) for (const year of [y - 1, y, y + 1]) {
    const s = ev.span(year);
    if (!s) continue;
    const stage = stageAt(today, s.start, s.end);
    // Short-notice events only start their timeline once their banner shows, so small dates don't crowd Today months ahead.
    const showFrom = ev.bannerFrom ? Math.max(70, daysFrom(ev.bannerFrom(year), s.start)) : Math.max(ev.bannerDays, 21);
    if (stage && (stage === "live" || stage === "review" || daysFrom(today, s.start) <= showFrom)) hits.push({ ev, year, ...s, stage });
  }
  const rank = (h: (typeof hits)[number]) => (h.stage === "live" ? 0 : h.stage === "review" ? 2 : 1);
  hits.sort((a, b) => rank(a) - rank(b) || b.ev.weight - a.ev.weight || daysFrom(today, a.start) - daysFrom(today, b.start));
  return hits[0] ?? null;
}

/**
 * Seasonal tasks to show today: the current stage first, then earlier stages not yet done (catch up),
 * only while the event has not started. Done ones are left out.
 */
export function seasonTasksFor(today: string, country: string, done: Set<string>, ctx: StoreCtx = {}): SeasonTask[] {
  const hit = timelineEvent(today, country);
  if (!hit) return [];
  const { ev, year, start, end, stage } = hit;
  const out: SeasonTask[] = [stageTask(ev, year, stage, start, end, today, ctx, false)];
  if (stage !== "live" && stage !== "review") {
    const showFrom = ev.bannerFrom ? 70 : Math.max(ev.bannerDays, 21);
    for (const s of ORDER.slice(0, ORDER.indexOf(stage)).reverse()) {
      const w = STAGE_WINDOWS[s as keyof typeof STAGE_WINDOWS];
      if (w.to > showFrom) continue; // that stage was before this event's timeline began
      out.push(stageTask(ev, year, s, start, end, today, ctx, true));
    }
  }
  return out.filter((t) => !done.has(t.taskId));
}

/** Rebuild a task from its id (for Do it for me). */
export function seasonTaskById(taskId: string, today: string, ctx: StoreCtx = {}): SeasonTask | null {
  const m = taskId.match(/^season-([a-z-]+)-(\d{4})-(plan|creators|codes|dress|live|review)$/);
  if (!m) return null;
  const ev = eventsForCountry("US").find((e) => e.key === m[1]);
  const year = Number(m[2]);
  const s = ev?.span(year);
  if (!ev || !s) return null;
  return stageTask(ev, year, m[3] as StageId, s.start, s.end, today, ctx, false);
}

