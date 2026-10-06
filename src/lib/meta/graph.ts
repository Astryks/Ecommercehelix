import { createHmac } from "node:crypto";
import { GRAPH_BASE } from "./config";
import { assertWriteAllowed, GuardrailError, type WriteContext } from "./guardrail";

/**
 * Minimal Graph API client: appsecret_proof, paging, rate-limit aware retries with backoff,
 * the paused-only guardrail on every write, and a log callback for the audit log.
 */

export type Method = "GET" | "POST" | "DELETE";
export type GraphResponse = { status: number; body: unknown; headers: Record<string, string | undefined> };
export type Transport = (method: Method, url: string, body?: URLSearchParams) => Promise<GraphResponse>;
export type CallLog = {
  method: Method;
  path: string;
  outcome: "ok" | "error" | "blocked" | "retry";
  httpStatus?: number;
  attempt: number;
  durationMs: number;
  errorCode?: number;
  message?: string;
  paramKeys: string[];
};

type GraphErrorBody = { error?: { message?: string; code?: number; error_subcode?: number; is_transient?: boolean } };

export class GraphError extends Error {
  constructor(message: string, public code?: number, public httpStatus?: number, public retryAfterMs?: number) {
    super(message);
    this.name = "GraphError";
  }
}

/** Throttling codes: app, user, page, ad account and business use case limits. */
export const THROTTLE_CODES = new Set([4, 17, 32, 341, 613, 80000, 80001, 80002, 80003, 80004, 80005, 80006, 80008, 80009, 80014]);
export const MAX_WAIT_MS = 60_000;

export const fetchTransport: Transport = async (method, url, body) => {
  const res = await fetch(url, { method, body, cache: "no-store", signal: AbortSignal.timeout(30_000) });
  const headers: Record<string, string | undefined> = {};
  res.headers.forEach((v, k) => (headers[k.toLowerCase()] = v));
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { status: res.status, body: json, headers };
};

export function appSecretProof(token: string, secret: string) {
  return createHmac("sha256", secret).update(token).digest("hex");
}

export function encodeParams(params: Record<string, unknown>) {
  const out = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    out.set(k, typeof v === "object" ? JSON.stringify(v) : String(v));
  }
  return out;
}

/** Wait time from Meta's usage headers (estimated_time_to_regain_access is in minutes), else exponential backoff with jitter. */
export function retryDelayMs(attempt: number, headers: Record<string, string | undefined>, baseMs = 1000, rand = Math.random): number {
  let regainMin = 0;
  for (const h of ["x-business-use-case-usage", "x-ad-account-usage", "x-app-usage"]) {
    const raw = headers[h];
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const items = Object.values(parsed).flatMap((v) => (Array.isArray(v) ? v : [parsed]));
      for (const it of items as Record<string, number>[]) regainMin = Math.max(regainMin, Number(it?.estimated_time_to_regain_access) || 0);
      if ("reset_time_duration" in parsed) regainMin = Math.max(regainMin, Number(parsed.reset_time_duration) / 60 || 0);
    } catch {
      /* ignore malformed header */
    }
  }
  if (regainMin > 0) return regainMin * 60_000;
  return Math.round(baseMs * 2 ** (attempt - 1) * (0.75 + rand() * 0.5));
}

/** Highest usage percentage reported in the headers (0 to 100). */
export function usagePct(headers: Record<string, string | undefined>): number {
  let max = 0;
  for (const h of ["x-business-use-case-usage", "x-ad-account-usage", "x-app-usage"]) {
    const raw = headers[h];
    if (!raw) continue;
    try {
      const nums = raw.match(/"(call_count|total_cputime|total_time|acc_id_util_pct)":\s*([\d.]+)/g) ?? [];
      for (const n of nums) max = Math.max(max, Number(n.split(":")[1]));
    } catch {
      /* ignore */
    }
  }
  return max;
}

export type GraphOptions = {
  token?: string;
  appSecret?: string;
  transport?: Transport;
  log?: (l: CallLog) => void | Promise<void>;
  sleep?: (ms: number) => Promise<void>;
  maxAttempts?: number;
  baseUrl?: string;
};

export function createGraph(opts: GraphOptions) {
  const transport = opts.transport ?? fetchTransport;
  const sleep = opts.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
  const maxAttempts = opts.maxAttempts ?? 4;
  const base = opts.baseUrl ?? GRAPH_BASE;
  const log = async (l: CallLog) => {
    try {
      await opts.log?.(l);
    } catch {
      /* logging must never break the call */
    }
  };

  async function request<T>(method: Method, rawPath: string, params: Record<string, unknown> = {}, ctx?: WriteContext): Promise<T> {
    const path = rawPath.replace(/^\/+/, "");
    const paramKeys = Object.keys(params).filter((k) => k !== "access_token" && k !== "client_secret" && k !== "fb_exchange_token" && k !== "code");
    if (method !== "GET") {
      try {
        assertWriteAllowed({ method, path, params }, ctx ?? { approved: false });
      } catch (e) {
        await log({ method, path, outcome: "blocked", attempt: 0, durationMs: 0, message: (e as Error).message, paramKeys });
        throw e;
      }
    }
    const auth: Record<string, unknown> = {};
    if (opts.token) {
      auth.access_token = opts.token;
      if (opts.appSecret) auth.appsecret_proof = appSecretProof(opts.token, opts.appSecret);
    }
    const qs = encodeParams({ ...params, ...auth });
    const url = method === "GET" ? `${base}/${path}?${qs}` : `${base}/${path}`;

    for (let attempt = 1; ; attempt++) {
      const t0 = Date.now();
      let res: GraphResponse;
      try {
        res = await transport(method, url, method === "GET" ? undefined : qs);
      } catch (e) {
        const canRetry = method === "GET" && attempt < maxAttempts;
        await log({ method, path, outcome: canRetry ? "retry" : "error", attempt, durationMs: Date.now() - t0, message: (e as Error).message, paramKeys });
        if (!canRetry) throw new GraphError(`Network error calling ${path}: ${(e as Error).message}`);
        await sleep(retryDelayMs(attempt, {}));
        continue;
      }
      const err = (res.body as GraphErrorBody | null)?.error;
      if (res.status < 400 && !err) {
        await log({ method, path, outcome: "ok", httpStatus: res.status, attempt, durationMs: Date.now() - t0, paramKeys });
        if (usagePct(res.headers) >= 90) await sleep(2000); // ease off before Meta throttles us
        return res.body as T;
      }
      const code = err?.code;
      const throttled = res.status === 429 || (code !== undefined && THROTTLE_CODES.has(code));
      // Writes retry only when Meta rejected the call for rate limits, never on 5xx, to avoid duplicates.
      const transient = throttled || (method === "GET" && (res.status >= 500 || err?.is_transient === true));
      const delay = retryDelayMs(attempt, res.headers);
      if (transient && attempt < maxAttempts && delay <= MAX_WAIT_MS) {
        await log({ method, path, outcome: "retry", httpStatus: res.status, attempt, durationMs: Date.now() - t0, errorCode: code, message: err?.message, paramKeys });
        await sleep(delay);
        continue;
      }
      await log({ method, path, outcome: "error", httpStatus: res.status, attempt, durationMs: Date.now() - t0, errorCode: code, message: err?.message, paramKeys });
      throw new GraphError(err?.message ?? `Graph API error ${res.status}`, code, res.status, throttled ? delay : undefined);
    }
  }

  return {
    get: <T = Record<string, unknown>>(path: string, params?: Record<string, unknown>) => request<T>("GET", path, params),
    post: <T = { id?: string; success?: boolean }>(path: string, params: Record<string, unknown>, ctx: WriteContext) => request<T>("POST", path, params, ctx),
    del: <T = { success?: boolean }>(path: string, ctx: WriteContext) => request<T>("DELETE", path, {}, ctx),
    /** Follow paging.next up to maxPages. */
    async getAll<T>(path: string, params: Record<string, unknown> = {}, maxPages = 10): Promise<T[]> {
      const out: T[] = [];
      let after: string | undefined;
      for (let i = 0; i < maxPages; i++) {
        const page = await request<{ data?: T[]; paging?: { cursors?: { after?: string }; next?: string } }>("GET", path, { limit: 100, ...params, ...(after ? { after } : {}) });
        out.push(...(page.data ?? []));
        after = page.paging?.next ? page.paging?.cursors?.after : undefined;
        if (!after) break;
      }
      return out;
    },
  };
}

export type Graph = ReturnType<typeof createGraph>;
export { GuardrailError };
