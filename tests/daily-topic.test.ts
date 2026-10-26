import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { TOPICS, TOPIC_EPOCH, topicFor, topicIndex, emailTopic, instagramPost, facebookGroupPost, takeaway } from "@/lib/daily-topic";
import { composeDaily } from "@/lib/email/daily-mix";
import { dailyEmail } from "@/lib/email/templates";
import { STAGE_ORDER } from "@/lib/stages";

const addDays = (d: string, n: number) => new Date(Date.parse(d + "T12:00:00Z") + n * 864e5).toISOString().slice(0, 10);
const BANNED = /skool|ecommerce equation|black belt|\bnsw\b|sydney|astryks|lawyer|real brand/i;

describe("daily topic calendar", () => {
  it("has at least 60 topics, ordered Attract, Convert, Grow", () => {
    expect(TOPICS.length).toBeGreaterThanOrEqual(60);
    const ranks = TOPICS.map((t) => STAGE_ORDER.indexOf(t.stage));
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });
  it("never repeats inside a cycle and starts again after it", () => {
    const ids = Array.from({ length: TOPICS.length }, (_, i) => topicFor(addDays(TOPIC_EPOCH, i)).ref);
    expect(new Set(ids).size).toBe(TOPICS.length);
    expect(topicIndex(TOPIC_EPOCH)).toBe(0);
    expect(topicFor(addDays(TOPIC_EPOCH, TOPICS.length)).ref).toBe(TOPICS[0].ref);
  });
  it("every format links into the app and avoids banned words", () => {
    for (const t of TOPICS) {
      const e = emailTopic(t);
      expect(e.button.href).toMatch(/^\/learn\/\d\d-[a-z0-9-]+#lesson-/);
      expect(e.subject.length).toBeLessThanOrEqual(70);
      const all = [e.subject, e.intro, e.hook, e.takeaway, e.teaserStep, instagramPost(t), facebookGroupPost(t, TOPIC_EPOCH), takeaway(t)].join(" ");
      expect(all).not.toMatch(BANNED);
      expect(instagramPost(t).length).toBeLessThan(facebookGroupPost(t, TOPIC_EPOCH).length);
    }
  });
  it("daily email leads with the topic and keeps the unsubscribe footer", () => {
    const c = { baseUrl: "https://ecommercehelix.com", unsubUrl: "https://ecommercehelix.com/api/email/unsubscribe?t=x&k=daily", prefsUrl: "https://ecommercehelix.com/dashboard/settings/emails", name: "Sam" };
    const subjects = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const d = addDays(TOPIC_EPOCH, i);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = dailyEmail(c as any, composeDaily({ seed: "u1", date: d }));
      subjects.add(e.subject);
      expect(e.text).toContain("Key takeaway:");
      expect(e.text.toLowerCase()).toContain("unsubscribe");
    }
    expect(subjects.size).toBe(30);
  });
  it.runIf(process.env.WRITE_CALENDAR === "1")("writes the content calendar", () => {
    const rows = TOPICS.map((t, i) => {
      const d = addDays(TOPIC_EPOCH, i);
      const e = emailTopic(t);
      return { date: d, n: i + 1, stage: t.stage, ref: t.ref, title: t.title, email_subject: e.subject, email_takeaway: e.takeaway, link: `https://ecommercehelix.com${t.href}`, instagram: instagramPost(t), facebook_group: facebookGroupPost(t, d) };
    });
    fs.mkdirSync("docs/social/daily", { recursive: true });
    fs.writeFileSync("docs/social/daily/calendar.json", JSON.stringify(rows, null, 1));
    const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
    fs.writeFileSync("docs/social/daily/calendar.csv", ["date,n,stage,ref,title,email_subject,email_takeaway,link,instagram,facebook_group", ...rows.map((r) => [r.date, r.n, r.stage, r.ref, q(r.title), q(r.email_subject), q(r.email_takeaway), r.link, q(r.instagram), q(r.facebook_group)].join(","))].join("\n"));
    fs.writeFileSync("docs/social/daily/calendar.md", `# Daily topic calendar (${rows.length} days, cycle 1 from ${TOPIC_EPOCH})\n\nSame theme each day in three formats: email teaser, Instagram hook, members' Facebook group lesson. Prepared only; nothing is scheduled.\n\n| Day | Date | Stage | Topic | Email subject |\n|---|---|---|---|---|\n${rows.map((r) => `| ${r.n} | ${r.date} | ${r.stage} | ${r.title} (${r.ref}) | ${r.email_subject} |`).join("\n")}\n\n## Sample: day 1\n\n### Instagram\n\n${rows[0].instagram}\n\n### Facebook group\n\n${rows[0].facebook_group}\n`);
  });
});
