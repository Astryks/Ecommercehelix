import "server-only";
import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";
import { parseModuleSections, type ParsedLesson } from "./lesson-parse";
import { listModules } from "./learn";

/**
 * Card decks: every lesson split into one-action cards, plus the "setup" deck
 * (understand your business) that comes first. One path: setup, then the
 * user's current course goal lessons, then every other lesson in order.
 */
export type Card = {
  key: string;
  kind: "talk" | "step" | "input" | "profit" | "done";
  title: string;
  html: string; // the one thing to do (or say)
  expectedHtml?: string; // "you'll know it worked when"
  watchHtml?: string; // careful
  simpleHtml?: string; // "I'm lost" version: shorter and calmer
  field?: string; // setup deck input
};
export type Deck = { id: string; title: string; slug: string | null; cards: Card[] };

const DIR = path.join(process.cwd(), "docs", "playbook");
const marked = new Marked({ gfm: true });
const md = (s: string) => (marked.parse(s, { async: false }) as string).replace(/href="(\d\d-[a-z0-9-]+)\.md(#[^"]*)?"/g, 'href="/learn/$1$2"').replace(/href="\.\.\/glossary\.md[^"]*"/g, 'href="/learn/words"');
const strip = (s: string) => s.replace(/<!--[\s\S]*?-->/g, "").replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\s+/g, " ").trim();

/** First sentence of a markdown block, as plain text. */
export function firstSentence(s: string, max = 200) {
  const t = strip(s);
  const m = t.match(/^(.{12,}?[.!?])(\s|$)/);
  const out = m ? m[1] : t;
  return out.length > max ? out.slice(0, max - 3).replace(/\s\S*$/, "") + "..." : out;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export type SimpleStep = { say: string; check: string; careful?: string; lost: string };
export type SimpleLesson = { intro: string; steps: SimpleStep[] };

/** Child-simple rewrites live in docs/cards/NN.json, one entry per lesson ref, one per step. */
export function loadSimple(moduleNumber: number): Record<string, SimpleLesson> {
  const f = path.join(process.cwd(), "docs", "cards", String(moduleNumber).padStart(2, "0") + ".json");
  return fs.existsSync(f) ? (JSON.parse(fs.readFileSync(f, "utf8")) as Record<string, SimpleLesson>) : {};
}

export function lessonDeck(l: ParsedLesson, slug: string | null, simple?: SimpleLesson): Deck {
  if (simple && simple.steps.length === l.steps.length) return simpleDeck(l, slug, simple);
  const n = l.steps.length;
  const cards: Card[] = [
    {
      key: `${l.ref}-intro`,
      kind: "talk",
      title: "Okay, don't worry.",
      html: `<p>This little deck is about <strong>${esc(l.title)}</strong>. We'll do it one tiny step at a time.</p>${l.why ? `<p>Why it helps: ${esc(firstSentence(l.why))}</p>` : ""}`,
      simpleHtml: `<p>Take a breath. You don't need to know anything yet. Just tap Next and do one small thing.</p>`,
    },
    ...l.steps.map((s, i): Card => ({
      key: `${l.ref}-s${s.n}`,
      kind: "step",
      title: `Step ${i + 1} of ${n}`,
      html: md(s.instruction),
      expectedHtml: s.expected ? md(s.expected) : undefined,
      watchHtml: s.watchOut ? md(s.watchOut) : undefined,
      simpleHtml: `<p>Just do this one bit:</p><p><strong>${esc(firstSentence(s.instruction, 220))}</strong></p>${s.expected ? `<p>You'll know it worked when: ${esc(firstSentence(s.expected, 200))}</p>` : ""}<p>That's all for this card. If it feels hard, open the full lesson and use Guide me.</p>`,
    })),
    {
      key: `${l.ref}-done`,
      kind: "done",
      title: "You did it!",
      html: `<p>That's every card in <strong>${esc(l.title)}</strong>. Nice and steady. Tap Next for the next little deck, or stop here for today.</p>`,
    },
  ];
  return { id: l.ref, title: l.title, slug, cards };
}

function simpleDeck(l: ParsedLesson, slug: string | null, x: SimpleLesson): Deck {
  const n = l.steps.length;
  return {
    id: l.ref,
    title: l.title,
    slug,
    cards: [
      { key: `${l.ref}-intro`, kind: "talk", title: "Okay, don't worry.", html: `<p>This little deck is about <strong>${esc(l.title)}</strong>.</p>${md(x.intro)}`, simpleHtml: "<p>Take a breath. You don't need to know anything yet. Just tap Next.</p>" },
      ...x.steps.map((s, i): Card => ({
        key: `${l.ref}-s${l.steps[i].n}`,
        kind: "step",
        title: `Step ${i + 1} of ${n}`,
        html: md(s.say),
        expectedHtml: md(s.check),
        watchHtml: s.careful ? md(s.careful) : undefined,
        simpleHtml: md(s.lost) + "<p>That's the whole card. Tap Next when it's done.</p>",
      })),
      { key: `${l.ref}-done`, kind: "done", title: "You did it!", html: `<p>That's every card in <strong>${esc(l.title)}</strong>. Nice and steady. Tap Next for the next little deck, or stop here for today.</p>` },
    ],
  };
}

export function simpleCoverage() {
  const { decks } = load();
  let rewritten = 0;
  decks.forEach((d) => { if (d.cards[0].simpleHtml?.startsWith("<p>Take a breath. You don't need to know anything yet. Just tap Next.</p>")) rewritten++; });
  return { rewritten, total: decks.size };
}

let cache: { order: string[]; decks: Map<string, Deck> } | null = null;

function load() {
  if (cache) return cache;
  const decks = new Map<string, Deck>();
  const order: string[] = [];
  for (const m of listModules()) {
    const text = fs.readFileSync(path.join(DIR, m.slug + ".md"), "utf8");
    const simple = loadSimple(m.number);
    for (const s of parseModuleSections(text)) {
      if (s.kind !== "lesson" || !s.steps.length) continue;
      decks.set(s.ref, lessonDeck(s, m.slug, simple[s.ref]));
      order.push(s.ref);
    }
  }
  cache = { order, decks };
  return cache;
}

export const SETUP_DECK: Deck = {
  id: "setup",
  title: "Understand your business",
  slug: null,
  cards: [
    { key: "setup-hi", kind: "talk", title: "Okay, don't worry.", html: "<p>We'll go one tiny step at a time. No rush, no wrong answers.</p><p><strong>Step 1: let's understand your business.</strong></p>", simpleHtml: "<p>You're not behind. Just tap Next. That's the only job on this card.</p>" },
    { key: "setup-name", kind: "input", field: "productName", title: "What do you sell?", html: "<p>Type it in a few words. For example: <em>candles</em> or <em>dog leads</em>.</p>", simpleHtml: "<p>Just the name of your main thing. Short is perfect.</p>" },
    { key: "setup-price", kind: "input", field: "price", title: "How much does one sell for?", html: "<p>The price a customer pays for one. If your price includes GST or VAT, take it out first (with 10% GST, divide by 1.1).</p>", simpleHtml: "<p>Just the price on your shop for one. A guess is okay; you can change it later.</p>" },
    { key: "setup-cost", kind: "input", field: "productCost", title: "How much does one cost you to make or buy?", html: "<p>What you pay for one, before you sell it. Not sure? Use your last supplier bill and divide by how many you got.</p>", simpleHtml: "<p>What you paid for one. A guess is fine.</p>" },
    { key: "setup-ship", kind: "input", field: "shipToCustomer", title: "How much do you pay to post one order?", html: "<p>The postage you pay to send it. If the customer pays for shipping, take that part off. Put 0 if shipping costs you nothing.</p>", simpleHtml: "<p>The postage you pay. 0 is okay.</p>" },
    { key: "setup-fees", kind: "input", field: "fees", title: "What does your payment provider keep?", html: "<p>Every card payment has a small fee. We filled in 1.75% plus $0.30, a common card fee. Check your payments settings and change it if yours is different.</p>", simpleHtml: "<p>Leave the numbers as they are if you're not sure. You can fix them later.</p>" },
    { key: "setup-ads", kind: "input", field: "marketingPerOrder", title: "How much do ads cost you for one order?", html: "<p>Add up what you spent on ads last month, then divide by your orders last month. No ads yet? Put 0.</p>", simpleHtml: "<p>No ads, or not sure? Put 0. That's fine.</p>" },
    { key: "setup-orders", kind: "input", field: "ordersPerMonth", title: "About how many orders a month?", html: "<p>A rough number is fine. Just starting? Put 0.</p>", simpleHtml: "<p>Any rough number. 0 is okay.</p>" },
    { key: "setup-profit", kind: "profit", title: "Here's what one order leaves you", html: "" },
    { key: "setup-done", kind: "done", title: "You did it!", html: "<p>Your numbers are saved, and your dashboard uses them now. Next, we'll start your first lesson, one card at a time.</p>" },
  ],
};

export function deckOrder(goalLessons: string[] = []): string[] {
  const { order } = load();
  const first = goalLessons.filter((r) => order.includes(r));
  return ["setup", ...first, ...order.filter((r) => !first.includes(r))];
}

export function getDeck(id: string): Deck | null {
  if (id === "setup") return SETUP_DECK;
  return load().decks.get(id) ?? null;
}

export function deckStats() {
  const { decks } = load();
  let cards = 0;
  decks.forEach((d) => (cards += d.cards.length));
  return { lessonDecks: decks.size, lessonCards: cards, setupCards: SETUP_DECK.cards.length };
}

export const CARDS_PER_DAY = 3;
