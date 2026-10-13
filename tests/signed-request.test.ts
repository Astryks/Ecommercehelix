import { createHmac } from "node:crypto";
import { describe, it, expect } from "vitest";
import { parseSignedRequest } from "../src/lib/meta/signed-request";

const make = (payload: object, secret: string) => {
  const p = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${createHmac("sha256", secret).update(p).digest("base64url")}.${p}`;
};

describe("Meta signed_request", () => {
  it("accepts a correctly signed request", () => {
    expect(parseSignedRequest(make({ algorithm: "HMAC-SHA256", user_id: "123" }, "s3cret"), "s3cret")?.user_id).toBe("123");
  });
  it("rejects a wrong signature, bad algorithm or junk", () => {
    expect(parseSignedRequest(make({ algorithm: "HMAC-SHA256", user_id: "1" }, "other"), "s3cret")).toBeNull();
    expect(parseSignedRequest(make({ algorithm: "NONE", user_id: "1" }, "s3cret"), "s3cret")).toBeNull();
    expect(parseSignedRequest("junk", "s3cret")).toBeNull();
    expect(parseSignedRequest(make({ algorithm: "HMAC-SHA256", user_id: "1" }, ""), "")).toBeNull();
  });
});
