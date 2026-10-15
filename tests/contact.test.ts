import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { confirmationEmail, deliverContact, validateContact } from "@/lib/contact";

const input = { name: "Sam", email: "sam@example.com", topic: "General question", message: "Please visit http://spam.example now" };

describe("contact form", () => {
  it("the confirmation email never repeats the message", () => {
    const e = confirmationEmail(input, "support@example.com");
    expect(e.to).toBe("sam@example.com");
    expect(e.text).not.toContain("spam.example");
    expect(e.text).toContain("General question");
  });
  it("signed-out visitors get no confirmation; members do", async () => {
    vi.stubEnv("RESEND_API_KEY", "test");
    vi.stubEnv("EMAIL_FROM", "Helix <hi@example.com>");
    const sent: string[] = [];
    const f = vi.spyOn(globalThis, "fetch").mockImplementation(async (_u, init) => {
      sent.push(JSON.parse(String((init as RequestInit).body)).to);
      return new Response(JSON.stringify({ id: "x" }), { status: 200 });
    });
    expect((await deliverContact(input)).ok).toBe(true);
    expect(sent).toHaveLength(1);
    sent.length = 0;
    await deliverContact(input, { id: "u1", plan: "FREE" });
    expect(sent).toEqual([expect.any(String), "sam@example.com"]);
    f.mockRestore();
    vi.unstubAllEnvs();
  });
  it("validates the basics", () => {
    expect(validateContact({ ...input, message: "short" })).toMatch(/more/);
    expect(validateContact(input)).toBeNull();
  });
});
