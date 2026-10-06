import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/**
 * AES-256-GCM encryption for third-party access tokens at rest.
 * Format: v1.<iv>.<tag>.<ciphertext>, each part base64url. The AAD binds a blob to its owner
 * (for example "meta:<userId>") so a stored token cannot be swapped onto another user.
 */

export function loadKey(raw: string | undefined = process.env.TOKEN_ENCRYPTION_KEY, allowDevKey = false): Buffer {
  if (raw) {
    const buf = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");
    if (buf.length !== 32) throw new Error("TOKEN_ENCRYPTION_KEY must be 32 bytes: 64 hex characters or 44 base64 characters.");
    return buf;
  }
  // Mock mode only: a fixed development key so the app runs with no secrets. Never used in live mode.
  if (allowDevKey) return createHash("sha256").update("helix-dev-only-key-not-secret").digest();
  throw new Error("TOKEN_ENCRYPTION_KEY is not set.");
}

export function encrypt(plain: string, key: Buffer, aad: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key, iv);
  c.setAAD(Buffer.from(aad, "utf8"));
  const ct = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  const tag = c.getAuthTag();
  return ["v1", iv.toString("base64url"), tag.toString("base64url"), ct.toString("base64url")].join(".");
}

export function decrypt(blob: string, key: Buffer, aad: string): string {
  const [v, iv, tag, ct] = blob.split(".");
  if (v !== "v1" || !iv || !tag || ct === undefined) throw new Error("Unrecognised token format.");
  const d = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
  d.setAAD(Buffer.from(aad, "utf8"));
  d.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([d.update(Buffer.from(ct, "base64url")), d.final()]).toString("utf8");
}
