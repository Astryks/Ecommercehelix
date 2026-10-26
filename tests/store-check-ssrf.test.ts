import { describe, expect, it, vi, afterAll, beforeAll } from "vitest";
vi.mock("server-only", () => ({}));
const dnsAnswers: Record<string, { address: string; family: number }[]> = {};
vi.mock("node:dns", async (orig) => {
  const real = (await orig()) as typeof import("node:dns");
  return {
    ...real,
    lookup: (host: string, _opts: unknown, cb: (e: Error | null, a?: unknown) => void) => {
      const a = dnsAnswers[host];
      return a ? cb(null, a) : cb(Object.assign(new Error("ENOTFOUND"), { code: "ENOTFOUND" }));
    },
  };
});
import http from "node:http";
import type { AddressInfo } from "node:net";
import { normaliseStoreUrl, resolveRedirect, isPrivateIp } from "@/lib/site-audit/guard";
import { guardedLookup, safeGet } from "@/lib/site-audit/fetch";

describe("store check SSRF guard: URLs", () => {
  it.each([
    "http://localhost./", "http://LOCALHOST", "http://metadata.google.internal./computeMetadata/v1/", "http://metadata/",
    "http://instance-data/latest", "http://printer.lan", "http://nas.home.arpa", "http://api.svc.cluster.local",
    "http://2130706433/", "http://0x7f.1/", "http://0177.0.0.1/", "http://[::ffff:127.0.0.1]/", "http://[::ffff:a9fe:a9fe]/",
    "http://[fe80::1]/", "http://[fd00::1]/", "http://100.64.0.1/", "http://169.254.169.254./latest/meta-data/", "http://0.0.0.0/",
    "https://shop.com:8443/", "http://shop.com:443/", "gopher://shop.com/", "javascript:alert(1)", "data:text/html,hi", "file:///etc/passwd",
  ])("blocks %s", (u) => expect(normaliseStoreUrl(u)).toBeNull());

  it("allows normal public stores (default ports only)", () => {
    expect(normaliseStoreUrl("https://allbirds.com:443/")?.host).toBe("allbirds.com");
    expect(normaliseStoreUrl("http://shop.example.com/")?.host).toBe("shop.example.com");
  });

  it("re-validates redirect targets", () => {
    const from = new URL("https://shop.com/");
    expect(resolveRedirect("http://169.254.169.254/", from)).toBeNull();
    expect(resolveRedirect("//localhost./x", from)).toBeNull();
    expect(resolveRedirect("ftp://shop.com/", from)).toBeNull();
    expect(resolveRedirect("/products", from)?.toString()).toBe("https://shop.com/products");
  });

  it("treats every non-public IP range as private", () => {
    for (const ip of ["10.1.2.3", "172.31.0.1", "192.168.1.1", "127.0.0.2", "169.254.1.1", "::1", "fc00::1", "64:ff9b::7f00:1", "2002:7f00:1::"]) expect(isPrivateIp(ip)).toBe(true);
    for (const ip of ["8.8.8.8", "1.1.1.1", "2606:4700::1111"]) expect(isPrivateIp(ip)).toBe(false);
  });
});

describe("store check SSRF guard: DNS (rebinding safe, checked at connect time)", () => {
  const look = (host: string, all = false) => new Promise<unknown>((res, rej) => guardedLookup(host, { all } as never, ((e: Error | null, a: unknown) => (e ? rej(e) : res(a))) as never));

  it("refuses a name that resolves to a private address", async () => {
    dnsAnswers["evil.example"] = [{ address: "127.0.0.1", family: 4 }];
    await expect(look("evil.example")).rejects.toThrow(/not a public website/);
  });
  it("refuses when ANY answer is private (mixed A records)", async () => {
    dnsAnswers["mixed.example"] = [{ address: "8.8.8.8", family: 4 }, { address: "169.254.169.254", family: 4 }];
    await expect(look("mixed.example", true)).rejects.toThrow(/not a public website/);
  });
  it("allows a public answer", async () => {
    dnsAnswers["ok.example"] = [{ address: "8.8.8.8", family: 4 }];
    await expect(look("ok.example")).resolves.toBe("8.8.8.8");
  });
});

describe("safeGet end to end", () => {
  let server: http.Server;
  let port = 0;
  beforeAll(async () => {
    server = http.createServer((req, res) => {
      if (req.url === "/redirect-private") { res.writeHead(302, { location: "http://127.0.0.1/secret" }); return res.end(); }
      res.end("secret");
    });
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    port = (server.address() as AddressInfo).port;
  });
  afterAll(() => server.close());

  it("never connects to a loopback server, by IP or by a name that resolves to it", async () => {
    await expect(safeGet(`http://127.0.0.1:${port}/`)).rejects.toThrow(/not a public website/);
    dnsAnswers["rebind.example"] = [{ address: "127.0.0.1", family: 4 }];
    await expect(safeGet("http://rebind.example/")).rejects.toThrow(/not a public website/);
  });
});
