import "server-only";
import { lookup } from "node:dns/promises";
import { isPrivateIp, normaliseStoreUrl } from "./guard";

export const UA = "Mozilla/5.0 (compatible; HelixStoreCheck/1.0; +https://ecommercehelix.com)";
export const TIMEOUT_MS = 15_000;
export const MAX_BYTES = 1_500_000;
const MAX_REDIRECTS = 4;

export type Fetched = { url: string; status: number; body: string; bytes: number; ms: number; truncated: boolean; contentType: string };

/** Resolve the host and refuse if any address is private. */
async function assertPublicHost(u: URL) {
  const host = u.hostname.replace(/^\[|\]$/g, "");
  const addrs = await lookup(host, { all: true, verbatim: true });
  // Local dev only: some sandboxes resolve every host to a 198.18.x.x fake IP. Never honoured in production.
  const fakeOk = process.env.NODE_ENV !== "production" && process.env.SITE_AUDIT_ALLOW_FAKE_IP === "1";
  const blocked = (ip: string) => isPrivateIp(ip) && !(fakeOk && /^198\.1[89]\./.test(ip));
  if (!addrs.length || addrs.some((a) => blocked(a.address))) throw new Error("That address is not a public website.");
}

/**
 * A guarded GET: http/https only, public IPs only (checked on every redirect hop),
 * 15 s timeout, body capped at 1.5 MB. Never throws for HTTP errors; throws for blocked or failed requests.
 */
export async function safeGet(input: string, opts: { timeoutMs?: number; maxBytes?: number } = {}): Promise<Fetched> {
  const started = Date.now();
  const deadline = AbortSignal.timeout(opts.timeoutMs ?? TIMEOUT_MS);
  let url = normaliseStoreUrl(input);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!url) throw new Error("That address is not a public website.");
    await assertPublicHost(url);
    const res = await fetch(url, { redirect: "manual", signal: deadline, headers: { "user-agent": UA, accept: "text/html,application/json;q=0.9,*/*;q=0.5" }, cache: "no-store" });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      url = normaliseStoreUrl(new URL(res.headers.get("location")!, url).toString());
      await res.body?.cancel();
      continue;
    }
    const max = opts.maxBytes ?? MAX_BYTES;
    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    let truncated = false;
    if (reader) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > max) {
          chunks.push(value.subarray(0, value.byteLength - (bytes - max)));
          truncated = true;
          await reader.cancel();
          break;
        }
        chunks.push(value);
      }
    }
    const body = new TextDecoder("utf-8", { fatal: false }).decode(Buffer.concat(chunks));
    return { url: url.toString(), status: res.status, body, bytes: Math.min(bytes, max), ms: Date.now() - started, truncated, contentType: res.headers.get("content-type") ?? "" };
  }
  throw new Error("Too many redirects.");
}
