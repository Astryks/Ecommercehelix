import { describe, expect, it } from "vitest";
import { cancelEmail, dailyTasksEmail, eventEmail, paymentFailedEmail, receiptEmail, welcomeEmail, winbackEmail, scorecardHtmlEmail } from "@/lib/email/templates";
import { dueEmails, localHour } from "@/lib/email/schedule";

const c = { name: "Jamie Lee", baseUrl: "https://ecommercehelix.com", unsubUrl: "https://ecommercehelix.com/api/email/unsubscribe?t=tok&k=daily" };

describe("email templates", () => {
  it("marketing emails carry an unsubscribe link; transactional ones say they are always sent", () => {
    for (const e of [dailyTasksEmail(c, [{ title: "Check numbers", minutes: 2 }], "Friday"), eventEmail(c, { name: "Christmas", daysTo: 14, line: "x", lesson: { label: "Go", href: "/learn" } }), winbackEmail(c), scorecardHtmlEmail(c, "S", "Hi,\nSales: $1")]) {
      expect(e.marketing).toBe(true); expect(e.html).toContain("unsubscribe?t=tok"); expect(e.text).toContain("Unsubscribe:");
    }
    for (const e of [welcomeEmail(c), receiptEmail(c, { amount: "US$29.00", plan: "Starter", date: "Oct 15" }), paymentFailedEmail(c, { amount: "US$29.00", updateUrl: "https://pay" }), cancelEmail(c, { until: "November 15, 2026" })]) {
      expect(e.marketing).toBe(false); expect(e.html).not.toContain("unsubscribe?t="); expect(e.html).toContain("always sent");
    }
  });
  it("uses the first name, escapes HTML and keeps the key promises", () => {
    expect(welcomeEmail(c).text.startsWith("Hi Jamie,")).toBe(true);
    expect(welcomeEmail({ ...c, name: "<b>x</b>" }).html).not.toContain("<b>x</b>");
    const k = cancelEmail(c, { until: "November 15, 2026" });
    expect(k.subject).toBe("Thank you for being a Helix member"); expect(k.text).toContain("November 15, 2026"); expect(k.html).toContain("Resubscribe");
    expect(paymentFailedEmail(c, { amount: "US$29.00", updateUrl: "https://pay/x" }).html).toContain("https://pay/x");
    expect(receiptEmail(c, { amount: "US$29.00", plan: "Starter", date: "Oct 15" }).text).toContain("Cancel anytime, in one click. No lock-in.");
  });
});

describe("email schedule", () => {
  const base = { createdAt: new Date("2026-01-01T00:00:00Z"), isDemo: false, country: "US", timezone: "America/New_York", status: "active", subscriptionId: null, currentPeriodEnd: null };
  it("daily email only in the 6-9 AM local window, keyed by local date", () => {
    const morning = new Date("2026-10-15T11:30:00Z"); // 7:30 AM New York (EDT)
    expect(localHour(morning, "America/New_York")).toBe(7);
    const d = dueEmails(base, morning).find((x) => x.kind === "daily");
    expect(d?.key).toBe("2026-10-15");
    expect(dueEmails(base, new Date("2026-10-15T18:00:00Z")).find((x) => x.kind === "daily")).toBeUndefined();
  });
  it("Sydney users get theirs on Sydney time", () => {
    const d = dueEmails({ ...base, timezone: "Australia/Sydney", country: "AU" }, new Date("2026-10-14T20:30:00Z")); // 7:30 AM 15 Oct Sydney
    expect(d.find((x) => x.kind === "daily")?.key).toBe("2026-10-15");
  });
  it("event emails at 28, 14, 7, 1 and 0 days before", () => {
    // Black Friday 2026 is 27 Nov; 7 days before is 20 Nov.
    const ev = dueEmails(base, new Date("2026-11-20T12:00:00Z")).find((x) => x.kind === "event");
    expect(ev && ev.kind === "event" && ev.daysTo).toBe(7);
    expect(dueEmails(base, new Date("2026-11-19T12:00:00Z")).find((x) => x.kind === "event")).toBeUndefined();
  });
  it("win-back 14 days after access ended; welcome for new accounts; nothing for demo accounts", () => {
    const p = { ...base, status: "canceled", subscriptionId: "sub_9", currentPeriodEnd: new Date("2026-10-01T15:00:00Z") };
    expect(dueEmails(p, new Date("2026-10-15T11:30:00Z")).some((x) => x.kind === "winback")).toBe(true);
    expect(dueEmails(p, new Date("2026-10-10T11:30:00Z")).some((x) => x.kind === "winback")).toBe(false);
    expect(dueEmails({ ...base, createdAt: new Date("2026-10-15T00:00:00Z") }, new Date("2026-10-15T03:00:00Z")).some((x) => x.kind === "welcome")).toBe(true);
    expect(dueEmails({ ...base, isDemo: true }, new Date("2026-10-15T11:30:00Z"))).toEqual([]);
  });
});
