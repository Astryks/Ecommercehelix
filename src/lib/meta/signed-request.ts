import { createHmac, timingSafeEqual } from "node:crypto";

/** Verify a Meta signed_request (HMAC-SHA256 with the app secret) and return its payload, or null. */
export function parseSignedRequest(signed: string, secret: string): { user_id?: string; algorithm?: string } | null {
  const [sig, payload] = signed.split(".", 2);
  if (!sig || !payload || !secret) return null;
  const expected = createHmac("sha256", secret).update(payload).digest();
  const got = Buffer.from(sig, "base64url");
  if (got.length !== expected.length || !timingSafeEqual(got, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (String(data.algorithm ?? "").toUpperCase() !== "HMAC-SHA256") return null;
    return data;
  } catch {
    return null;
  }
}
