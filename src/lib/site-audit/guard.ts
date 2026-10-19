/**
 * SSRF guard for the store check. Pure, so it is unit-tested.
 * Only http/https on default ports, no credentials in the URL, and never a private,
 * loopback, link-local, CGNAT, multicast or reserved address.
 */
import { isIP } from "node:net";

export function normaliseStoreUrl(input: string): URL | null {
  const raw = input.trim();
  if (!raw) return null;
  let u: URL;
  try {
    u = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  if (u.username || u.password) return null;
  if (u.port && u.port !== "80" && u.port !== "443") return null;
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return null;
  if (isIP(host)) {
    if (isPrivateIp(host)) return null;
  } else if (!host.includes(".")) return null;
  return u;
}

function v4ToInt(ip: string): number {
  return ip.split(".").reduce((a, p) => (a << 8) + Number(p), 0) >>> 0;
}
const V4_BLOCKS: [string, number][] = [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12],
  ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.88.99.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24],
  ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4],
];

export function isPrivateIp(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) {
    const n = v4ToInt(ip);
    return V4_BLOCKS.some(([base, bits]) => (n >>> (32 - bits)) === (v4ToInt(base) >>> (32 - bits)));
  }
  if (kind === 6) {
    const h = v6ToHextets(ip);
    if (!h) return true;
    const v4 = (a: number, b: number) => `${h[a] >> 8}.${h[a] & 255}.${h[b] >> 8}.${h[b] & 255}`;
    if (h.every((x) => x === 0)) return true; // ::
    if (h.slice(0, 7).every((x) => x === 0) && h[7] === 1) return true; // ::1
    if (h.slice(0, 5).every((x) => x === 0) && (h[5] === 0 || h[5] === 0xffff)) return isPrivateIp(v4(6, 7)) || h[5] === 0; // ::a.b.c.d (deprecated, block) and ::ffff:a.b.c.d
    if (h[0] === 0x64 && h[1] === 0xff9b) return true; // NAT64
    if (h[0] === 0x2002) return isPrivateIp(v4(1, 2)); // 6to4 wraps an IPv4 address
    if (h[0] === 0x2001 && h[1] === 0) return true; // Teredo
    if (h[0] === 0x2001 && h[1] === 0xdb8) return true; // documentation
    if (h[0] === 0x100 && h[1] === 0 && h[2] === 0 && h[3] === 0) return true; // discard
    if ((h[0] & 0xfe00) === 0xfc00) return true; // unique local fc00::/7
    if ((h[0] & 0xffc0) === 0xfe80 || (h[0] & 0xffc0) === 0xfec0) return true; // link-local, old site-local
    if ((h[0] & 0xff00) === 0xff00) return true; // multicast
    if ((h[0] & 0xe000) !== 0x2000) return true; // only global unicast 2000::/3 is public
    return false;
  }
  return true;
}

/** Expand an IPv6 string (with optional zone and dotted tail) into 8 numbers. */
function v6ToHextets(ip: string): number[] | null {
  let x = ip.toLowerCase().replace(/%.*$/, "");
  const dotted = x.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted) {
    const n = v4ToInt(dotted[1]);
    x = x.slice(0, -dotted[1].length) + `${(n >>> 16).toString(16)}:${(n & 0xffff).toString(16)}`;
  }
  const [a, b] = x.split("::");
  const left = a ? a.split(":") : [];
  const right = b !== undefined && b ? b.split(":") : [];
  const fill = b === undefined ? 0 : 8 - left.length - right.length;
  if (fill < 0) return null;
  const parts = [...left, ...Array(fill).fill("0"), ...right].map((p) => parseInt(p, 16));
  return parts.length === 8 && parts.every((p) => p >= 0 && p <= 0xffff) ? parts : null;
}

/** Follow a redirect Location only if the new URL passes the same checks (scheme, port, host). */
export function resolveRedirect(location: string, from: URL): URL | null {
  let next: URL;
  try {
    next = new URL(location, from);
  } catch {
    return null;
  }
  if (next.protocol !== "http:" && next.protocol !== "https:") return null;
  return normaliseStoreUrl(next.toString());
}

/** Very small robots.txt reader: is `path` disallowed for all bots or for us? */
export function robotsDisallows(robots: string, path: string): boolean {
  let applies = false;
  let any = false;
  const rules: string[] = [];
  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const k = m[1].toLowerCase();
    const v = m[2].trim();
    if (k === "user-agent") {
      if (any) { applies = false; any = false; }
      if (v === "*" || /helixstorecheck/i.test(v)) applies = true;
    } else {
      any = true;
      if (applies && k === "disallow" && v) rules.push(v);
    }
  }
  return rules.some((r) => {
    const re = new RegExp("^" + r.replace(/[.+?^{}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$"));
    return re.test(path);
  });
}
