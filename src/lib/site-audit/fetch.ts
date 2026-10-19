import "server-only";
import { lookup } from "node:dns";
import http from "node:http";
import https from "node:https";
import type { LookupFunction } from "node:net";
import { isPrivateIp, normaliseStoreUrl, resolveRedirect } from "./guard";

export const UA = "Mozilla/5.0 (compatible; HelixStoreCheck/1.0; +https://ecommercehelix.com)";
export const TIMEOUT_MS = 15_000;
export const MAX_BYTES = 1_500_000;
const MAX_REDIRECTS = 4;
const BLOCKED = "That address is not a public website.";

export type Fetched = { url: string; status: number; body: string; bytes: number; ms: number; truncated: boolean; contentType: string };

function blocked(ip: string) {
  // Local dev only: some sandboxes resolve every host to a 198.18.x.x fake IP. Never honoured in production.
  const fakeOk = process.env.NODE_ENV !== "production" && process.env.SITE_AUDIT_ALLOW_FAKE_IP === "1";
  return isPrivateIp(ip) && !(fakeOk && /^198\.1[89]\./.test(ip));
}

/**
 * DNS lookup used by the socket itself, so the address we check is the address we connect to
 * (no gap for DNS rebinding between a pre-check and the real connection).
 */
export const guardedLookup: LookupFunction = (hostname, options, cb) => {
  lookup(hostname, { ...options, all: true, verbatim: true }, (err, addrs) => {
    if (err) return cb(err, "", 0);
    const list = addrs as unknown as { address: string; family: number }[];
    if (!list.length || list.some((a) => blocked(a.address))) return cb(new Error(BLOCKED), "", 0);
    if ((options as { all?: boolean }).all) return (cb as unknown as (e: null, a: typeof list) => void)(null, list);
    cb(null, list[0].address, list[0].family);
  });
};

type Raw = { status: number; location: string | null; contentType: string; body: Buffer; bytes: number; truncated: boolean };

function request(url: URL, signal: AbortSignal, max: number): Promise<Raw> {
  return new Promise((resolve, reject) => {
    const mod = url.protocol === "https:" ? https : http;
    const req = mod.request(url, { method: "GET", lookup: guardedLookup, signal, agent: false, headers: { "user-agent": UA, accept: "text/html,application/json;q=0.9,*/*;q=0.5", "accept-encoding": "identity" } }, (res) => {
      const status = res.statusCode ?? 0;
      const location = typeof res.headers.location === "string" ? res.headers.location : null;
      const contentType = String(res.headers["content-type"] ?? "");
      if (status >= 300 && status < 400 && location) {
        res.destroy();
        return resolve({ status, location, contentType, body: Buffer.alloc(0), bytes: 0, truncated: false });
      }
      const chunks: Buffer[] = [];
      let bytes = 0;
      let truncated = false;
      res.on("data", (c: Buffer) => {
        if (truncated) return;
        bytes += c.byteLength;
        if (bytes > max) {
          chunks.push(c.subarray(0, c.byteLength - (bytes - max)));
          truncated = true;
          res.destroy();
          resolve({ status, location: null, contentType, body: Buffer.concat(chunks), bytes: max, truncated, });
          return;
        }
        chunks.push(c);
      });
      res.on("end", () => resolve({ status, location: null, contentType, body: Buffer.concat(chunks), bytes, truncated }));
      res.on("error", (e) => (truncated ? undefined : reject(e)));
    });
    req.on("error", reject);
    req.end();
  });
}

/**
 * A guarded GET: http/https only, public IPs only (checked at connect time on every redirect hop),
 * 15 s timeout, body capped at 1.5 MB. Never throws for HTTP errors; throws for blocked or failed requests.
 */
export async function safeGet(input: string, opts: { timeoutMs?: number; maxBytes?: number } = {}): Promise<Fetched> {
  const started = Date.now();
  const deadline = AbortSignal.timeout(opts.timeoutMs ?? TIMEOUT_MS);
  const max = opts.maxBytes ?? MAX_BYTES;
  let url = normaliseStoreUrl(input);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!url) throw new Error(BLOCKED);
    const res = await request(url, deadline, max);
    if (res.location) {
      url = resolveRedirect(res.location, url);
      continue;
    }
    const body = new TextDecoder("utf-8", { fatal: false }).decode(res.body);
    return { url: url.toString(), status: res.status, body, bytes: res.bytes, ms: Date.now() - started, truncated: res.truncated, contentType: res.contentType };
  }
  throw new Error("Too many redirects.");
}
