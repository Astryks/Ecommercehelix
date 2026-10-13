/** Meta Marketing API settings. Graph API v26.0 is the current version (released 29 July 2026). */
export const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v26.0";
export const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;
export const DIALOG_URL = `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`;

/** Permissions requested. With Facebook Login for Business these live in the configuration (META_CONFIG_ID). */
export const META_SCOPES = ["ads_management", "ads_read", "business_management", "pages_show_list", "pages_read_engagement"];
/** Instagram is optional: the Login configuration does not ask for instagram_basic, so ads run with the Page identity unless an Instagram account is linked. */
/** META_PUBLIC=1 once Meta has approved the app (App Review and business verification). Until then only app testers can connect. */
export const metaPublic = () => process.env.META_PUBLIC === "1";

export type MetaMode = "live" | "mock" | "off";

/**
 * live: a real Meta app is configured.
 * mock: META_MOCK=1, or no app configured outside production. Uses fixture data, no network.
 * off:  production without a Meta app. The connect button is hidden.
 */
export function metaMode(env: Record<string, string | undefined> = process.env): MetaMode {
  if (env.META_MOCK === "1") return "mock";
  if (env.META_APP_ID && env.META_APP_SECRET) return "live";
  return env.NODE_ENV === "production" ? "off" : "mock";
}

/** Public base URL. Set APP_URL (or NEXT_PUBLIC_APP_URL) in production so the OAuth redirect URI is stable. */
export const appUrl = (fallback?: string) => (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || fallback || "http://localhost:3000").replace(/\/$/, "");
export const redirectUri = (fallback?: string) => `${appUrl(fallback)}/api/meta/callback`;
