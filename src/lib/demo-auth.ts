import { randomUUID } from "node:crypto";

/**
 * Demo login rules.
 *
 * The demo login exists so the app can be tried with zero keys. It must never
 * give access to a real or existing account, so:
 *  - every demo sign-in creates a brand new, isolated test user with a random id
 *  - the email typed on the form (if any) is ignored; demo users get a generated
 *    address on the reserved demo domain, so they can never match a real user
 *  - demo users are flagged (isDemo) and labelled "Demo account" in the UI
 *  - the demo login turns itself off once a real provider (Google, or email
 *    magic links via Resend) is configured
 */

export const DEMO_ID_PREFIX = "demo-";
export const DEMO_EMAIL_DOMAIN = "demo.helix.invalid";

type Env = Record<string, string | undefined>;

export type AuthProviderFlags = { google: boolean; email: boolean; dev: boolean };

/** Which sign-in providers are active for a given environment. */
export function authProviderFlags(env: Env): AuthProviderFlags {
  const hasDb = Boolean(env.DATABASE_URL);
  const google = Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET);
  const email = Boolean(hasDb && env.AUTH_RESEND_KEY);
  // ALLOW_DEV_LOGIN can force the demo login on for local work only. In production
  // it is ignored once a real provider exists, so it can never stay on by mistake.
  const forced = env.ALLOW_DEV_LOGIN === "true" && env.NODE_ENV !== "production";
  const dev = !google && !email ? true : forced;
  return { google, email, dev };
}

export type DemoIdentity = { id: string; email: string; name: string; isDemo: true };

/** A fresh, isolated demo identity. Never derived from user input other than the display name. */
export function createDemoIdentity(rawName?: unknown, uuid: () => string = randomUUID): DemoIdentity {
  const key = uuid().replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const name = (typeof rawName === "string" ? rawName : "").trim().slice(0, 60) || "Demo user";
  return { id: DEMO_ID_PREFIX + key, email: `demo-${key.slice(0, 12)}@${DEMO_EMAIL_DOMAIN}`, name, isDemo: true };
}

export function isDemoUserId(id: string | null | undefined): boolean {
  return typeof id === "string" && id.startsWith(DEMO_ID_PREFIX);
}

export function isDemoEmail(email: string | null | undefined): boolean {
  return typeof email === "string" && email.toLowerCase().endsWith("@" + DEMO_EMAIL_DOMAIN);
}

/**
 * Whether ensureUser may fall back to finding an existing user by email.
 * Never for demo sessions: a demo login must not be able to reach another account.
 */
export function mayLinkByEmail(id: string, email: string): boolean {
  return Boolean(email) && !isDemoUserId(id) && !isDemoEmail(email);
}
