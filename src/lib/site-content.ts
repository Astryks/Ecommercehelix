/** The site-wide content engine: given a date, what the whole site should feature. Pure and tested. */
import { bannerFor, featuredEvent, type Banner } from "./season-calendar";
import { DEFAULT_HERO, EVENT_CONTENT, EVERGREEN_TEMPLATES, TIPS, type ContentLink, type Tip } from "@/content/site-content";

export type SiteContent = {
  mode: "event" | "tip";
  eventKey: string | null;
  banner: Banner & { href: string };
  heroLine: string;
  /** Short extra line under the hero lead (only during events). */
  heroExtra: string | null;
  tip: Tip;
  featuredLesson: ContentLink;
  templates: string[];
};

/** Weeks since Monday 5 Jan 1970 (stable, changes every Monday). */
export const weekNumber = (today: string) => Math.floor((Date.parse(today + "T12:00:00Z") / 86_400_000 + 3) / 7);
export const weeklyTip = (today: string): Tip => TIPS[((weekNumber(today) % TIPS.length) + TIPS.length) % TIPS.length];

export function siteContent(today: string, country = "US"): SiteContent {
  const tip = weeklyTip(today);
  const hit = featuredEvent(today, country);
  const extra = hit ? EVENT_CONTENT[hit.event.key] : undefined;
  if (hit && extra) {
    const b = bannerFor(today, country);
    return { mode: "event", eventKey: hit.event.key, banner: { ...b, href: "/start" }, heroLine: DEFAULT_HERO, heroExtra: extra.hero, tip, featuredLesson: extra.lesson, templates: extra.templates };
  }
  const w = weekNumber(today);
  const n = EVERGREEN_TEMPLATES.length;
  return {
    mode: "tip", eventKey: hit?.event.key ?? null,
    banner: hit ? { ...bannerFor(today, country), href: "/start" } : { key: `tip-${tip.key}`, phase: "quiet", text: `Tip of the week: ${tip.text}`, badge: "New each Monday", cta: tip.cta.label, href: tip.cta.href },
    heroLine: DEFAULT_HERO, heroExtra: null, tip, featuredLesson: tip.cta,
    templates: [EVERGREEN_TEMPLATES[w % n], EVERGREEN_TEMPLATES[(w + 1) % n]],
  };
}

/** Allowed only outside production: lets previews show any date (?asOf=2026-11-20). */
export function previewDate(asOf: unknown, env: Record<string, string | undefined> = process.env): string | null {
  if (env.VERCEL_ENV === "production") return null;
  return typeof asOf === "string" && /^\d{4}-\d{2}-\d{2}$/.test(asOf) ? asOf : null;
}
