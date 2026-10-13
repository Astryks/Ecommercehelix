import "server-only";
import { deckOrder, getDeck, CARDS_PER_DAY, type Deck } from "./cards";
import { getCardState, getProductName, getProfitSetup, type CardState } from "./repo";
import { getCourse } from "./course";
import { isoDay } from "./dates";

export type UserCards = { state: CardState; deck: Deck; index: number; nextDeck: string | null; todayLeft: number; fresh: boolean; profitSet: boolean };

/** Where this user is in the one card path: setup first (until profit is saved), then their goal's lessons, then the rest. */
export async function userCards(userId: string): Promise<UserCards> {
  const [state, profit, course] = await Promise.all([getCardState(userId), getProfitSetup(userId), getCourse(userId).catch(() => null)]);
  const order = deckOrder(course?.current?.goal.lessons ?? []);
  let id = state.deck && getDeck(state.deck) ? state.deck : "";
  if (!id) id = profit ? order[1] ?? "setup" : "setup";
  const deck = getDeck(id)!;
  const index = Math.min(state.deck === id ? state.index : 0, deck.cards.length - 1);
  const at = order.indexOf(id);
  const nextDeck = order[at + 1] ?? null;
  const done = state.day === isoDay() ? state.today : 0;
  return { state, deck, index, nextDeck, todayLeft: Math.max(0, CARDS_PER_DAY - done), fresh: !state.deck && !profit, profitSet: Boolean(profit) };
}

export async function setupValues(userId: string): Promise<Record<string, string>> {
  const [p, name] = await Promise.all([getProfitSetup(userId), getProductName(userId)]);
  const s = (n: number | undefined, d = "") => (n === undefined || (n === 0 && d === "")) ? d : String(n);
  return {
    productName: name,
    price: s(p?.price), productCost: s(p?.productCost), shipToCustomer: s(p?.shipToCustomer),
    feePct: String(p?.feePct ?? 1.75), feeFixed: String(p?.feeFixed ?? 0.3),
    marketingPerOrder: s(p?.marketingPerOrder), ordersPerMonth: s(p?.ordersPerMonth),
    freightDuty: String(p?.freightDuty ?? 0), packaging: String(p?.packaging ?? 0),
  };
}
