import { describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";
import { decrypt, encrypt, loadKey } from "@/lib/crypto";

const key = randomBytes(32);

describe("token encryption (AES-256-GCM)", () => {
  it("round-trips", () => {
    const blob = encrypt("EAAB-secret-token", key, "meta:user1");
    expect(blob.startsWith("v1.")).toBe(true);
    expect(blob).not.toContain("EAAB");
    expect(decrypt(blob, key, "meta:user1")).toBe("EAAB-secret-token");
  });

  it("uses a fresh IV each time", () => {
    expect(encrypt("same", key, "a")).not.toBe(encrypt("same", key, "a"));
  });

  it("fails with the wrong key", () => {
    const blob = encrypt("token", key, "meta:user1");
    expect(() => decrypt(blob, randomBytes(32), "meta:user1")).toThrow();
  });

  it("fails when the blob is moved to another user (AAD binding)", () => {
    const blob = encrypt("token", key, "meta:user1");
    expect(() => decrypt(blob, key, "meta:user2")).toThrow();
  });

  it("fails when the ciphertext or tag is tampered with", () => {
    const [v, iv, tag, ct] = encrypt("token-value", key, "a").split(".");
    const flip = (s: string) => (s[0] === "A" ? "B" : "A") + s.slice(1);
    expect(() => decrypt([v, iv, tag, flip(ct)].join("."), key, "a")).toThrow();
    expect(() => decrypt([v, iv, flip(tag), ct].join("."), key, "a")).toThrow();
    expect(() => decrypt("v2.x.y.z", key, "a")).toThrow(/format/);
  });

  it("loads hex and base64 keys and rejects bad lengths", () => {
    const k = randomBytes(32);
    expect(loadKey(k.toString("hex")).equals(k)).toBe(true);
    expect(loadKey(k.toString("base64")).equals(k)).toBe(true);
    expect(() => loadKey("abcd")).toThrow(/32 bytes/);
    expect(() => loadKey(undefined, false)).toThrow(/not set/);
    expect(loadKey(undefined, true)).toHaveLength(32);
  });
});
