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
    const o = deckOrder(["7.1"]);
    if (getDeck("7.1")) expect(o[1]).toBe("7.1");
  });
  it("setup deck asks what you sell, then price", () => {
    expect(SETUP_DECK.cards[1].field).toBe("productName");
    expect(SETUP_DECK.cards[2].field).toBe("price");
  });
  it("splits a lesson into one card per step", () => {
    const l = parseLesson("Lesson 9.9: Test", "**Why this matters:** It helps. More.\n\n**Step 1.** Do A.\n\n**Expected result:** A done.\n\n**Step 2.** Do B.\n\n**Expected result:** B done.")!;
    const d = lessonDeck(l, "09-x");
    expect(d.cards.map((c) => c.kind)).toEqual(["talk", "step", "step", "done"]);
    expect(d.cards[0].html).toContain("It helps.");
  });
});
