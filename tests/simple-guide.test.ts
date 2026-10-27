import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { buildQuest, type QuestLesson } from "@/lib/quest";
import { buildTimeline } from "@/lib/simple/path-timeline";
import { ALERT_LEADS, alertWords, isLongText } from "@/lib/simple/text-alert";
import { chartSentence, daySeries } from "@/lib/simple/chart-series";
import { GUIDES } from "@/lib/simple/page-guides";
import { TextAlert } from "@/components/simple/TextAlert";
import { PathTimeline } from "@/components/simple/PathTimeline";

const L = (ref: string, stage: QuestLesson["stage"], stepId = "s"): QuestLesson => ({ ref, title: `T${ref}`, stage, href: `/learn/m#${ref}`, stepId, stepTitle: stepId });
const lessons = [L("1.1", "grow", "start-here"), L("3.1", "attract"), L("3.2", "attract"), L("13.1", "convert"), L("1.2", "grow")];
const freeRefs = new Set(["1.1", "3.1"]);

describe("TextAlert", () => {
  it("picks a stable lead and keeps full text collapsed", () => {
    expect(alertWords("a")).toEqual(alertWords("a"));
    const html = renderToStaticMarkup(createElement(TextAlert, { summary: "do one thing a day.", seed: "x", children: "FULL BODY TEXT" }));
    expect(html).toContain('data-testid="text-alert"');
    expect(html).toContain("do one thing a day.");
    expect(html).toContain("<details");
    expect(html).not.toMatch(/<details[^>]*open/);
    expect(ALERT_LEADS.some((l) => html.includes(l))).toBe(true);
  });
  it("flags long text", () => {
    expect(isLongText("short")).toBe(false);
    expect(isLongText(Array(60).fill("word").join(" "))).toBe(true);
  });
});

describe("chart series", () => {
  it("needs 2 points for a sentence and says up/down", () => {
    expect(chartSentence([], "day", "sales")).toBeNull();
    const s = chartSentence([{ label: "a", sales: 10, profit: 1 }, { label: "b", sales: 20, profit: 2 }], "day", "sales");
    expect(s).toMatch(/up/i);
  });
  it("drops empty days", () => {
    expect(daySeries([], 30)).toEqual([]);
  });
});

describe("page guides", () => {
  it("every blurb is at most 2 short sentences", () => {
    for (const g of Object.values(GUIDES)) {
      expect(g.what.split(/[.!?](?:\s|$)/).filter((x) => x.trim().length > 1).length).toBeLessThanOrEqual(2);
      expect(g.what.length).toBeLessThan(160);
    }
  });
});

describe("path timeline", () => {
  it("0%: first node is here, next is start", () => {
    const t = buildTimeline(buildQuest(lessons, () => false), () => true, "/dashboard/billing");
    expect(t.pct).toBe(0);
    expect(t.next?.ref).toBe("1.1");
    expect(t.stages[0].nodes[0].state).toBe("here");
  });
  it("mid: badge nudge counts lessons left in the current stage", () => {
    const done = new Set(["1.1", "3.1"]);
    const t = buildTimeline(buildQuest(lessons, (r) => done.has(r)), () => true, "/u");
    expect(t.nextBadge).toBe("Attract master");
    expect(t.toNextBadge).toBe(1);
    expect(t.next?.ref).toBe("3.2");
  });
  it("100%: no next, complete state renders", () => {
    const q = buildQuest(lessons, () => true);
    const t = buildTimeline(q, () => true, "/u");
    expect(t.pct).toBe(100);
    expect(t.next).toBeNull();
    const html = renderToStaticMarkup(createElement(PathTimeline, { t, full: true, unlockHref: "/u" }));
    expect(html).toContain('data-testid="path-complete"');
  });
  it("free: locked nodes are teasers pointing at unlock, never the lesson link", () => {
    const t = buildTimeline(buildQuest(lessons, () => false), (r) => freeRefs.has(r), "/dashboard/billing");
    const locked = t.stages.flatMap((s) => s.nodes).filter((n) => n.state === "locked");
    expect(locked.length).toBe(3);
    for (const n of locked) expect(n.href).toBe("/dashboard/billing");
    const html = renderToStaticMarkup(createElement(PathTimeline, { t, full: false, unlockHref: "/dashboard/billing" }));
    expect(html).not.toContain("/learn/m#3.2");
    expect(html).not.toContain("/learn/m#13.1");
  });
});
