import { describe, it, expect } from "vitest";
import { signPass, readPass, seminarKey, demoUnlockAllowed } from "@/lib/seminars/pass";

describe("seminar pass cookie", () => {
  it("round-trips and rejects tampering", () => {
    const v = signPass(["a", "b", "a"], "s1");
    expect(readPass(v, "s1")).toEqual(["a", "b"]);
    expect(readPass(v, "s2")).toEqual([]);
    const [body, sig] = v.split(".");
    const forged = Buffer.from(JSON.stringify(["a", "b", "c"])).toString("base64url");
    expect(readPass(`${forged}.${sig}`, "s1")).toEqual([]);
    expect(readPass(`${body}.x`, "s1")).toEqual([]);
    expect(readPass(undefined, "s1")).toEqual([]);
  });
});

describe("test-mode only Stripe key", () => {
  it("uses only test keys unless SEMINARS_LIVE=1", () => {
    expect(seminarKey({ STRIPE_SECRET_KEY: "sk_live_x" })).toBeNull();
    expect(seminarKey({ STRIPE_SECRET_KEY: "sk_live_x", SEMINARS_LIVE: "1" })).toBe("sk_live_x");
    expect(seminarKey({ STRIPE_SECRET_KEY: "sk_live_x", SEMINAR_STRIPE_SECRET_KEY: "sk_test_y" })).toBe("sk_test_y");
    expect(seminarKey({})).toBeNull();
  });
  it("never allows the free demo unlock on production", () => {
    expect(demoUnlockAllowed({ VERCEL_ENV: "production" })).toBe(false);
    expect(demoUnlockAllowed({ VERCEL_ENV: "preview" })).toBe(true);
    expect(demoUnlockAllowed({ VERCEL_ENV: "preview", STRIPE_SECRET_KEY: "sk_test_1" })).toBe(false);
  });
});
