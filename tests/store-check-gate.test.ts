import { describe, expect, it } from "vitest";
import { checkGate } from "@/lib/site-audit/gate";

const now = Date.parse("2026-10-15T10:00:00Z");
const ago = (min: number) => new Date(now - min * 60_000).toISOString();

describe("store check gate", () => {
  it("first check is free", () => expect(checkGate({ last: null, paid: false, running: false, now })).toBe("ok"));
  it("one check at a time", () => expect(checkGate({ last: null, paid: true, running: true, now })).toBe("running"));
  it("waits 10 minutes after a failed check", () => {
    expect(checkGate({ last: { ok: false, startedAt: ago(3) }, paid: false, running: false, now })).toBe("wait");
    expect(checkGate({ last: { ok: false, startedAt: ago(11) }, paid: false, running: false, now })).toBe("ok");
  });
  it("free users upgrade for a recheck; paid wait 6 hours", () => {
    expect(checkGate({ last: { ok: true, startedAt: ago(600) }, paid: false, running: false, now })).toBe("upgrade");
    expect(checkGate({ last: { ok: true, startedAt: ago(60) }, paid: true, running: false, now })).toBe("recent");
    expect(checkGate({ last: { ok: true, startedAt: ago(400) }, paid: true, running: false, now })).toBe("ok");
  });
});
