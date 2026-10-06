import { describe, expect, it } from "vitest";
import {
  authProviderFlags,
  createDemoIdentity,
  DEMO_EMAIL_DOMAIN,
  isDemoEmail,
  isDemoUserId,
  mayLinkByEmail,
} from "@/lib/demo-auth";

describe("demo login identities", () => {
  it("creates a new isolated user on every sign-in, even with the same input", () => {
    const a = createDemoIdentity("Sid");
    const b = createDemoIdentity("Sid");
    expect(a.id).not.toBe(b.id);
    expect(a.email).not.toBe(b.email);
    expect(isDemoUserId(a.id)).toBe(true);
    expect(isDemoEmail(a.email)).toBe(true);
    expect(a.isDemo).toBe(true);
    expect(a.email.endsWith("@" + DEMO_EMAIL_DOMAIN)).toBe(true);
  });

  it("never uses an email typed by the visitor", () => {
    // Only the display name is accepted; there is no way to pass an email in.
    const victim = "owner@realstore.com";
    const d = createDemoIdentity(victim);
    expect(d.email).not.toBe(victim);
    expect(d.email).not.toContain("realstore");
    expect(isDemoEmail(d.email)).toBe(true);
  });

  it("uses a safe default name and trims long names", () => {
    expect(createDemoIdentity(undefined).name).toBe("Demo user");
    expect(createDemoIdentity("   ").name).toBe("Demo user");
    expect(createDemoIdentity("x".repeat(200)).name).toHaveLength(60);
  });

  it("never lets a demo session link to an existing account by email", () => {
    const d = createDemoIdentity("Sid");
    expect(mayLinkByEmail(d.id, d.email)).toBe(false);
    expect(mayLinkByEmail(d.id, "owner@realstore.com")).toBe(false);
    expect(mayLinkByEmail("cuid123", "x@" + DEMO_EMAIL_DOMAIN)).toBe(false);
    // The old demo id format is not a demo id and has no special rights either way.
    expect(mayLinkByEmail("ckz1abc", "owner@realstore.com")).toBe(true);
    expect(mayLinkByEmail("ckz1abc", "")).toBe(false);
  });
});

describe("demo login availability", () => {
  const db = { DATABASE_URL: "postgres://x" };

  it("is on when no real provider is configured", () => {
    expect(authProviderFlags({ NODE_ENV: "production" }).dev).toBe(true);
    expect(authProviderFlags({ NODE_ENV: "production", ...db }).dev).toBe(true);
  });

  it("turns off automatically once Google is configured", () => {
    const f = authProviderFlags({ NODE_ENV: "production", AUTH_GOOGLE_ID: "id", AUTH_GOOGLE_SECRET: "s" });
    expect(f).toEqual({ google: true, email: false, dev: false });
  });

  it("turns off automatically once Resend magic links are configured", () => {
    const f = authProviderFlags({ NODE_ENV: "production", ...db, AUTH_RESEND_KEY: "re_x" });
    expect(f).toEqual({ google: false, email: true, dev: false });
  });

  it("keeps the demo login if Resend has no database (magic links need one), so nobody is locked out", () => {
    expect(authProviderFlags({ NODE_ENV: "production", AUTH_RESEND_KEY: "re_x" }).dev).toBe(true);
  });

  it("ignores ALLOW_DEV_LOGIN=true in production when a real provider exists", () => {
    const f = authProviderFlags({ NODE_ENV: "production", AUTH_GOOGLE_ID: "id", AUTH_GOOGLE_SECRET: "s", ALLOW_DEV_LOGIN: "true" });
    expect(f.dev).toBe(false);
  });

  it("allows ALLOW_DEV_LOGIN=true for local development only", () => {
    const f = authProviderFlags({ NODE_ENV: "development", AUTH_GOOGLE_ID: "id", AUTH_GOOGLE_SECRET: "s", ALLOW_DEV_LOGIN: "true" });
    expect(f.dev).toBe(true);
  });
});
