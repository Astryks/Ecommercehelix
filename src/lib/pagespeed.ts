/**
 * Finishing step — PageSpeed Insights pull (Google, free API key, optional).
 *
 * The site check was plain fetches, so the audit rules had no real speed
 * evidence and `mobile-gap` could never fire on real data. This module
 * pulls the mobile performance score + LCP from the PageSpeed Insights API
 * (v5) and stores them on the site-check facts, so signals.ts can feed
 * them to the rules and signal-coverage.ts can stop stripping the evidence.
 *
 * Graceful by design: no PAGESPEED_API_KEY = no pull, no speed evidence,
 * and the rules stay suppressed exactly as before — never invented.
 * A failed pull (timeout, quota, bad key) also returns null and is logged
 * as a skipped check, never as a fake score.
 */

export type PageSpeedResult = {
  score: number | null; // 0-100, mobile performance
  lcpSeconds: number | null;
  fetchedAt: string;
};

/** Parse a PageSpeed Insights v5 response into score + LCP. Pure, tested. */
export function parsePageSpeedResponse(j: unknown): { score: number | null; lcpSeconds: number | null } {
  const o = (j ?? {}) as Record<string, unknown>;
  const lr = (o.lighthouseResult ?? {}) as Record<string, unknown>;
  const cats = (lr.categories ?? {}) as Record<string, { score?: number }>;
  const audits = (lr.audits ?? {}) as Record<string, { displayValue?: string; numericValue?: number }>;
  const score = typeof cats.performance?.score === "number" ? Math.round(cats.performance.score * 100) : null;
  const lcp = audits["largest-contentful-paint"];
  let lcpSeconds: number | null = null;
  if (typeof lcp?.numericValue === "number") lcpSeconds = Math.round((lcp.numericValue / 1000) * 10) / 10;
  else if (typeof lcp?.displayValue === "string") {
    const m = lcp.displayValue.match(/([\d.]+)\s*s/);
    if (m) lcpSeconds = Number(m[1]);
  }
  return { score, lcpSeconds };
}

/**
 * One PageSpeed pull for a store URL. Returns null without a key or on any
 * failure. `fetchFn` is injectable so tests never hit the network.
 */
export async function fetchPageSpeed(
  url: string,
  apiKey?: string,
  fetchFn: typeof fetch = fetch,
): Promise<PageSpeedResult | null> {
  if (!apiKey) return null;
  const u = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  u.searchParams.set("url", url);
  u.searchParams.set("strategy", "mobile");
  u.searchParams.set("category", "performance");
  u.searchParams.set("key", apiKey);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);
  try {
    const res = await fetchFn(u.toString(), { signal: ctrl.signal, cache: "no-store" });
    if (!res.ok) return null;
    const j = (await res.json().catch(() => null)) as unknown;
    const { score, lcpSeconds } = parsePageSpeedResponse(j);
    if (score === null && lcpSeconds === null) return null;
    return { score, lcpSeconds, fetchedAt: new Date().toISOString() };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
