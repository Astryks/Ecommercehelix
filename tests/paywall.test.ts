import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import fs from "node:fs";
import path from "node:path";
import { canOpenDeck, canReadLesson, gateCoachHit, hasFullLearn, refFromLearnHref, unlockHref } from "@/lib/paywall/access";
import { FREE_LESSONS } from "@/lib/paywall/free-lessons";
import { planForStatus } from "@/lib/billing";
import { teaserFor } from "@/lib/paywall/teaser";
import { findLesson, listModules } from "@/lib/learn";
import { PATH } from "@/lib/learn-path";

const allRefs = listModules().flatMap((m) => m.lessons.flatMap((l) => (l.ref ? [l.ref] : [])));

describe("Learn paywall: access rule", () => {
  it("Free and signed-out read only the free list; Starter and Growth read everything", () => {
    for (const ref of allRefs) {
      expect(canReadLesson("free", ref)).toBe(FREE_LESSONS.includes(ref));
      expect(canReadLesson(undefined, ref)).toBe(FREE_LESSONS.includes(ref));
      expect(canReadLesson("starter", ref)).toBe(true);
      expect(canReadLesson("growth", ref)).toBe(true);
    }
    expect(hasFullLearn("free")).toBe(false);
    expect(hasFullLearn(null)).toBe(false);
  });

  it("Stripe states map the existing way: trial and past_due keep access, canceled and unpaid lose it", () => {
    expect(hasFullLearn(planForStatus("active", "starter"))).toBe(true);
    expect(hasFullLearn(planForStatus("trialing", "starter"))).toBe(true);
    expect(hasFullLearn(planForStatus("past_due", "growth"))).toBe(true);
    for (const s of ["canceled", "unpaid", "incomplete", "incomplete_expired", "paused"]) expect(hasFullLearn(planForStatus(s, "growth"))).toBe(false);
  });

  it("every free ref is a real lesson, and most lessons are locked", () => {
    for (const r of FREE_LESSONS) expect(allRefs).toContain(r);
    expect(FREE_LESSONS.length).toBeLessThan(allRefs.length * 0.1);
  });

  it("each stage of the path has at least one free lesson, including the start of Attract", () => {
    for (const stage of ["start", "attract", "convert", "grow"]) expect(PATH.filter((p) => p.stage === stage).some((p) => p.refs.some((r) => FREE_LESSONS.includes(r)))).toBe(true);
    expect(FREE_LESSONS).toContain(PATH.find((p) => p.stage === "attract")!.refs[0]);
  });

  it("setup deck stays open; lesson decks follow the lesson rule", () => {
    expect(canOpenDeck("free", "setup")).toBe(true);
    expect(canOpenDeck("free", "9.1")).toBe(false);
    expect(canOpenDeck("starter", "9.1")).toBe(true);
  });

  it("unlock button goes to billing when signed in, pricing when not", () => {
    expect(unlockHref(true)).toBe("/dashboard/billing");
    expect(unlockHref(false)).toBe("/#pricing");
  });
});

describe("Learn paywall: lesson refs from links", () => {
  it("reads the ref back from every lesson anchor", () => {
    for (const m of listModules()) for (const l of m.lessons) if (l.ref) expect(refFromLearnHref(`/learn/${m.slug}#${l.id}`)).toBe(l.ref);
  });
});

describe("Learn paywall: teasers never carry the lesson body", () => {
  it("every locked lesson has a short teaser without step text", () => {
    for (const ref of allRefs) {
      const t = teaserFor(ref);
      const l = findLesson(ref)!;
      expect(t, ref).not.toBeNull();
      expect(t!.title.length).toBeGreaterThan(0);
      expect(t!.summary.length).toBeGreaterThanOrEqual(1);
      expect(t!.summary.length).toBeLessThanOrEqual(3);
      expect(t!.minutes).toBeGreaterThanOrEqual(3);
      const joined = t!.summary.join(" ");
      expect(joined.length).toBeLessThan(700);
      for (const s of l.steps) {
        const firstWords = s.instruction.replace(/[*_`[\]]/g, "").replace(/\([^)]*\)/g, "").trim().slice(0, 60);
        if (firstWords.length >= 40) expect(joined.includes(firstWords), `${ref} step ${s.n}`).toBe(false);
      }
    }
  });
});

describe("Learn paywall: coach", () => {
  const long = "x ".repeat(2000);
  const lockedHref = "/learn/09-ad-analysis-audiences-and-setup#lesson-91-x";
  it("trims locked lesson text for Free and adds the unlock pointer", () => {
    const h = gateCoachHit("free", { id: "a", title: "t", href: lockedHref, text: long, tokens: 1000, score: 1 });
    expect(h.text.length).toBeLessThan(500);
    expect(h.text).toMatch(/locked lesson/i);
    expect(h.text).toMatch(/Starter/);
  });
  it("leaves free lessons and paid users alone", () => {
    const free = gateCoachHit("free", { id: "a", title: "t", href: "/learn/01-daily-profit-foundations#lesson-17-sales", text: long, tokens: 1000, score: 1 });
    expect(free.text).toBe(long);
    expect(gateCoachHit("starter", { id: "a", title: "t", href: lockedHref, text: long, tokens: 1000, score: 1 }).text).toBe(long);
  });
});

describe("Learn paywall: server-rendered lesson page", () => {
  it("does not send a locked lesson's steps to a Free viewer, but does to Starter", async () => {
    const viewer = { signedIn: true, plan: "free" as "free" | "starter", full: false };
    vi.doMock("@/lib/paywall/viewer", () => ({ learnViewer: async () => viewer }));
    vi.doMock("@/components/learn/AnchorRedirect", () => ({ AnchorRedirect: () => null }));
    vi.doMock("@/components/SiteHeader", () => ({ SiteHeader: () => null }));
    vi.doMock("@/components/SiteFooter", () => ({ SiteFooter: () => null }));
    const { renderToStaticMarkup } = await import("react-dom/server");
    const Page = (await import("@/app/learn/[slug]/page")).default;
    const slug = "09-ad-analysis-audiences-and-setup";
    const l = findLesson("9.1")!;
    const needle = l.steps[0].instruction.replace(/[*_`[\]]/g, "").split(/[.(]/)[0].trim().slice(0, 30);
    const html = async () => renderToStaticMarkup(await Page({ params: Promise.resolve({ slug }) } as never));
    // Every lesson object handed to the (client) lesson player ends up in the page payload, so collect them from the tree.
    const sentRefs = async () => {
      const out: string[] = [];
      const walk = (n: unknown): void => {
        if (Array.isArray(n)) return n.forEach(walk);
        if (n && typeof n === "object" && "props" in n) {
          const p = (n as { props: { lesson?: { ref: string }; children?: unknown } }).props;
          if (p.lesson?.ref) out.push(p.lesson.ref);
          walk(p.children);
        }
      };
      walk(await Page({ params: Promise.resolve({ slug }) } as never));
      return out;
    };
    const freeHtml = await html();
    expect(freeHtml).toContain('data-testid="locked-lesson"');
    expect(freeHtml).toContain("Unlock with Starter");
    expect(freeHtml.includes(needle)).toBe(false);
    const freeSent = await sentRefs();
    expect(freeSent).not.toContain("9.1");
    expect(freeSent.every((r) => FREE_LESSONS.includes(r))).toBe(true);
    viewer.plan = "starter"; viewer.full = true;
    const paidHtml = await html();
    expect(paidHtml).not.toContain('data-testid="locked-lesson"');
    expect(await sentRefs()).toContain("9.1");
  });
});

it("free-lessons config is the one file to edit", () => {
  expect(fs.existsSync(path.join(process.cwd(), "src/lib/paywall/free-lessons.ts"))).toBe(true);
});
