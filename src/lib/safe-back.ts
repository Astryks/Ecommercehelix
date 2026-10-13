/**
 * A safe in-app return path for dashboard forms: only /dashboard paths on this site,
 * an optional query string kept, never another host (no open redirect).
 */
export function safeDashboardPath(raw: unknown, fallback = "/dashboard/insights"): string {
  const s = typeof raw === "string" ? raw : "";
  return /^\/dashboard(\/[\w-]+)*\/?(\?[\w\-=&%.]*)?$/.test(s) ? s : fallback;
}

/** Add one query parameter to a path that may already have a query string. */
export function withParam(path: string, key: string, value: string): string {
  return `${path}${path.includes("?") ? "&" : "?"}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}
