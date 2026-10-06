import { describe, expect, it, vi } from "vitest";
import { createGraph, GraphError, retryDelayMs, type CallLog, type Transport } from "@/lib/meta/graph";
import { GuardrailError } from "@/lib/meta/guardrail";
import { mockTransport } from "@/lib/meta/mock";
import { adParams, adsetParams, campaignParams, creativeParams, starterCopy, type DraftInput } from "@/lib/meta/drafts";

const okRes = (body: unknown) => ({ status: 200, body, headers: {} });
const noSleep = async () => {};

describe("graph client", () => {
  it("never sends a blocked write to the network and logs it", async () => {
    const transport = vi.fn<Transport>();
    const logs: CallLog[] = [];
    const g = createGraph({ token: "t", transport, sleep: noSleep, log: (l) => void logs.push(l) });
    await expect(g.post("act_1/campaigns", { name: "x", status: "ACTIVE" }, { approved: true })).rejects.toBeInstanceOf(GuardrailError);
    await expect(g.post("123", { daily_budget: 99999 }, { approved: true })).rejects.toBeInstanceOf(GuardrailError);
    await expect(g.del("123", { approved: true })).rejects.toBeInstanceOf(GuardrailError);
    expect(transport).not.toHaveBeenCalled();
    expect(logs.map((l) => l.outcome)).toEqual(["blocked", "blocked", "blocked"]);
  });

  it("adds appsecret_proof and keeps the token out of logs", async () => {
    let seen = "";
    const transport: Transport = async (_m, url) => ((seen = url), okRes({ id: "1" }));
    const logs: CallLog[] = [];
    const g = createGraph({ token: "SECRET_TOKEN", appSecret: "app-secret", transport, log: (l) => void logs.push(l) });
    await g.get("me", { fields: "id" });
    expect(seen).toContain("appsecret_proof=");
    expect(JSON.stringify(logs)).not.toContain("SECRET_TOKEN");
  });

  it("retries throttling errors with backoff, then succeeds", async () => {
    const transport = vi
      .fn<Transport>()
      .mockResolvedValueOnce({ status: 400, body: { error: { code: 17, message: "User request limit reached" } }, headers: {} })
      .mockResolvedValueOnce({ status: 400, body: { error: { code: 80004, message: "Too many calls to this ad account" } }, headers: {} })
      .mockResolvedValueOnce(okRes({ data: [] }));
    const sleeps: number[] = [];
    const g = createGraph({ token: "t", transport, sleep: async (ms) => void sleeps.push(ms) });
    await expect(g.get("act_1/insights")).resolves.toEqual({ data: [] });
    expect(transport).toHaveBeenCalledTimes(3);
    expect(sleeps).toHaveLength(2);
    expect(sleeps[1]).toBeGreaterThan(sleeps[0] * 0.9);
  });

  it("honours estimated_time_to_regain_access and gives up when the wait is too long", async () => {
    const headers = { "x-business-use-case-usage": JSON.stringify({ "1": [{ type: "ads_management", call_count: 100, estimated_time_to_regain_access: 15 }] }) };
    expect(retryDelayMs(1, headers)).toBe(15 * 60_000);
    const transport = vi.fn<Transport>().mockResolvedValue({ status: 400, body: { error: { code: 80004, message: "throttled" } }, headers });
    const g = createGraph({ token: "t", transport, sleep: noSleep });
    await expect(g.get("act_1/insights")).rejects.toBeInstanceOf(GraphError);
    expect(transport).toHaveBeenCalledTimes(1);
  });

  it("does not retry a write after a server error (avoids duplicate objects)", async () => {
    const transport = vi.fn<Transport>().mockResolvedValue({ status: 500, body: { error: { code: 2, message: "Service temporarily unavailable", is_transient: true } }, headers: {} });
    const g = createGraph({ token: "t", transport, sleep: noSleep });
    await expect(g.post("act_1/campaigns", { name: "x", status: "PAUSED" }, { approved: true })).rejects.toBeInstanceOf(GraphError);
    expect(transport).toHaveBeenCalledTimes(1);
  });

  it("follows paging", async () => {
    const transport = vi
      .fn<Transport>()
      .mockResolvedValueOnce(okRes({ data: [{ id: 1 }], paging: { cursors: { after: "A" }, next: "https://next" } }))
      .mockResolvedValueOnce(okRes({ data: [{ id: 2 }], paging: { cursors: { after: "B" } } }));
    const g = createGraph({ token: "t", transport });
    expect(await g.getAll("act_1/campaigns")).toEqual([{ id: 1 }, { id: 2 }]);
    expect(String(transport.mock.calls[1][1])).toContain("after=A");
  });
});

describe("paused draft payloads", () => {
  const input: DraftInput = { adAccountId: "act_1111111111", pageId: "333", pixelId: "555", currency: "AUD", country: "AU", storeUrl: "https://linenco.com.au", dailyBudget: 138, dateTag: "20261006", instagramId: "444" };

  it("are all PAUSED and pass the guardrail end to end in mock mode", async () => {
    const posted: { path: string; status: unknown }[] = [];
    const transport: Transport = async (m, url, body) => {
      if (m === "POST") posted.push({ path: new URL(url).pathname, status: body?.get("status") });
      return mockTransport(m, url, body);
    };
    const g = createGraph({ token: "t", transport });
    const ctx = { approved: true };
    const c = await g.post(`${input.adAccountId}/campaigns`, campaignParams(input), ctx);
    const a = await g.post(`${input.adAccountId}/adsets`, adsetParams(input, c.id!), ctx);
    for (const [i, copy] of starterCopy(input.storeUrl).entries()) {
      const cr = await g.post(`${input.adAccountId}/adcreatives`, creativeParams(input, copy, i + 1), ctx);
      await g.post(`${input.adAccountId}/ads`, adParams(input, a.id!, cr.id!, i + 1), ctx);
    }
    const delivering = posted.filter((p) => !p.path.endsWith("adcreatives"));
    expect(delivering).toHaveLength(5);
    expect(delivering.every((p) => p.status === "PAUSED")).toBe(true);
  });

  it("uses the Sales objective with campaign budget in minor units and Advantage+ audience", () => {
    const c = campaignParams(input);
    expect(c.objective).toBe("OUTCOME_SALES");
    expect(c.daily_budget).toBe(13800);
    expect(adsetParams(input, "1").targeting.targeting_automation.advantage_audience).toBe(1);
  });

  it("throws if anyone flips a draft to ACTIVE", async () => {
    const g = createGraph({ token: "t", transport: mockTransport });
    await expect(g.post(`${input.adAccountId}/campaigns`, { ...campaignParams(input), status: "ACTIVE" }, { approved: true })).rejects.toBeInstanceOf(GuardrailError);
    await expect(g.post(`${input.adAccountId}/ads`, { ...adParams(input, "1", "2", 1), status: "ACTIVE" }, { approved: true })).rejects.toBeInstanceOf(GuardrailError);
  });
});
