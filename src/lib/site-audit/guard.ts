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
    const x = ip.toLowerCase();
    if (x === "::" || x === "::1") return true;
    const mapped = x.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIp(mapped[1]);
    if (/^::ffff:/.test(x)) return true;
    return /^(fc|fd|fe8|fe9|fea|feb|ff|2001:db8|64:ff9b)/.test(x);
  }
  return true;
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
