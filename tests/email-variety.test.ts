import { describe, expect, it } from "vitest";
import { composeDaily, recordSent, type DailyFacts, type DailyHistory } from "@/lib/email/daily-mix";
import { dailyEmail } from "@/lib/email/templates";
import { emailableAlerts, ALERT_COOLDOWN_DAYS } from "@/lib/email/cooldown";
import { buyPlan } from "@/lib/tools/inventory";
import { exampleStock, exampleSuppliers } from "@/lib/stock";
import { addDays } from "@/lib/dates";

const c = { name: "Sid", baseUrl: "https://ecommercehelix.com", unsubUrl: "https://ecommercehelix.com/api/email/unsubscribe?t=tok&k=daily", prefsUrl: "https://ecommercehelix.com/dashboard/settings/emails" };
const facts: DailyFacts = {
  lesson: { title: "Find your break-even line", step: "Work out the most you can pay in ads for one order.", href: "/learn/x#y", minutes: 10 },
  goal: { title: "Set up your profit dashboard", day: 2, days: 3 },
  numbers: { sales: 1240, orders: 18, adSpend: 310, merPct: 25, avgSales: 1100, avgMerPct: 27 },
  hasAnyNumbers: true, hasAds: true, stage: "convert",
};

/** Simulate the cron: compose with history, record what was sent. */
function simulate(seed: string, from: string, n: number, f: DailyFacts = facts) {
  let h: DailyHistory = { days: [] };
  const out: { date: string; subject: string; text: string; tasks: string[] }[] = [];
  for (let i = 0; i < n; i++) {
    const date = addDays(from, i);
    const m = composeDaily({ seed, date, facts: f, history: h });
    if (!m) continue;
    const e = dailyEmail(c, m);
    out.push({ date, subject: e.subject, text: e.text, tasks: m.tasks.map((t) => t.title) });
    h = recordSent(h, date, m);
  }
  return out;
}

describe("daily emails never repeat", () => {
  for (const seed of ["sid", "cm9abc123", "user-42"]) {
    it(`14 consecutive days for ${seed}: no duplicate subject, body or task`, () => {
      const s = simulate(seed, "2026-10-27", 14);
      expect(s.length).toBeGreaterThanOrEqual(12);
      expect(new Set(s.map((x) => x.subject)).size).toBe(s.length);
      const bodies = s.map((x) => x.text.split("\n").filter((l) => !/^(Hi|Unsubscribe|Contact us|The Helix team|E-commerce Helix)/.test(l)).join("\n"));
      expect(new Set(bodies).size).toBe(s.length);
      for (let i = 1; i < s.length; i++) expect(s[i].subject).not.toBe(s[i - 1].subject);
      const lessonTitle = s[0].tasks.find((t) => t.startsWith("Lesson step:"));
      const all = s.flatMap((x) => x.tasks.filter((t) => t !== lessonTitle));
      expect(new Set(all).size).toBe(all.length); // no task sent twice (the open lesson reminder at most weekly)
      expect(s.filter((x) => x.tasks.includes(lessonTitle!)).length).toBeLessThanOrEqual(2);
    });
  }
  it("sends nothing when there is nothing new (every task and today's topic already sent)", () => {
    const noLesson = { ...facts, lesson: null };
    const tasks = new Set<string>();
    for (let i = 0; i < 400; i++) composeDaily({ seed: "sid", date: addDays("2025-01-01", i), facts: noLesson })!.tasks.forEach((t) => tasks.add(t.title));
    const date = "2026-10-27";
    const today = composeDaily({ seed: "sid", date, facts: noLesson })!;
    const h: DailyHistory = { days: [{ date: "2026-01-01", subject: today.subject, tasks: [...tasks], idea: today.idea, topic: today.topic.intro }] };
    expect(composeDaily({ seed: "sid", date, facts: noLesson, history: h })).toBeNull();
  });
  it("footer has unsubscribe and preferences, no postal address", () => {
    const e = dailyEmail({ ...c, postalAddress: "PO Box 1, Sydney" }, composeDaily({ seed: "sid", date: "2026-10-27", facts })!);
    expect(e.html).toContain("api/email/unsubscribe"); expect(e.html).toContain("dashboard/settings/emails"); expect(e.html).not.toContain("PO Box");
  });
});

describe("reorder bundle alert: at most once per trigger", () => {
  it("example stock (the seeded 'Weekend Bundle', out of stock) never raises a reorder alert", () => {
    const lines = buyPlan(exampleStock(), exampleSuppliers(), "2026-10-27");
    const bundle = lines.find((l) => l.sku === "BUN-05")!;
    expect(bundle.status).toBe("out");
    expect(bundle.example).toBe(true);
  });
  it("orderBy moves to today every day while out of stock (the old dated key changed daily)", () => {
    const real = exampleStock().map((s) => ({ ...s, example: false }));
    const a = buyPlan(real, exampleSuppliers(), "2026-10-27").find((l) => l.sku === "BUN-05")!;
    const b = buyPlan(real, exampleSuppliers(), "2026-10-28").find((l) => l.sku === "BUN-05")!;
    expect(a.orderBy).not.toBe(b.orderBy);
  });
  it("14 days of the same out-of-stock condition email once; again only after the cooldown", () => {
    const key = "reorder-BUN-05";
    const sent = new Map<string, string>();
    let count = 0;
    for (let i = 0; i < 14; i++) {
      const today = addDays("2026-10-27", i);
      // Worst case: the alert flip-flops and comes back as 'fresh' every single day.
      const ok = emailableAlerts([{ key }], sent, today);
      if (ok.length) { count++; sent.set(key, today); }
    }
    expect(count).toBe(1);
    expect(emailableAlerts([{ key }], sent, addDays("2026-10-27", ALERT_COOLDOWN_DAYS))).toHaveLength(1);
  });
});
