import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { deckOrder, deckStats, getDeck, SETUP_DECK, lessonDeck } from "@/lib/cards";
import { parseLesson } from "@/lib/lesson-parse";

describe("card decks", () => {
  it("every lesson with steps becomes a deck: intro, one card per step, done", () => {
    const s = deckStats();
    expect(s.lessonDecks).toBeGreaterThan(200);
    const order = deckOrder();
    expect(order[0]).toBe("setup");
    for (const id of order.slice(1)) {
      const d = getDeck(id)!;
      expect(d.cards[0].title).toBe("Okay, don't worry.");
      expect(d.cards.at(-1)!.kind).toBe("done");
      expect(d.cards.filter((c) => c.kind === "step").every((c) => c.simpleHtml)).toBe(true);
    }
  });
  it("goal lessons come straight after setup", () => {
    const o = deckOrder(["8.2"]);
    if (getDeck("8.2")) expect(o[1]).toBe("8.2");
  });
  it("setup deck asks what you sell, then price", () => {
    expect(SETUP_DECK.cards[1].field).toBe("productName");
    expect(SETUP_DECK.cards[2].field).toBe("price");
  });
  it("splits a lesson into one card per step", () => {
    const l = parseLesson("Lesson 14.8: Test", "**Why this matters:** It helps. More.\n\n**Step 1.** Do A.\n\n**Expected result:** A done.\n\n**Step 2.** Do B.\n\n**Expected result:** B done.")!;
    const d = lessonDeck(l, "09-x");
    expect(d.cards.map((c) => c.kind)).toEqual(["talk", "step", "step", "done"]);
    expect(d.cards[0].html).toContain("It helps.");
  });
});

describe("simple rewrites", () => {
  it("every rewrite file matches its lessons step for step", async () => {
    const fs = await import("node:fs");
    const { listModules } = await import("@/lib/learn");
    const { loadSimple } = await import("@/lib/cards");
    for (const m of listModules()) {
      const simple = loadSimple(m.number);
      for (const [ref, x] of Object.entries(simple)) {
        const d = getDeck(ref);
        expect(d, ref).toBeTruthy();
        expect(x.steps.length, ref).toBe(d!.cards.length - 2);
        for (const s of x.steps) { expect(s.say && s.check && s.lost, ref).toBeTruthy(); }
      }
      void fs;
    }
  });
});
