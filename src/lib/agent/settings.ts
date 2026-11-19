/**
 * Step 3 — Agent settings persistence (Job 2 guardrails page).
 *
 * Stored as a ToolInput row (kind "agent") — the established pattern for
 * per-user JSON settings with no schema change (see journey-server.ts).
 * In demo mode (no database) the settings live in memory, like the journey
 * level. Defaults are the safest: propose-only, no auto-post, no cap set
 * (which blocks L3 until the owner sets one).
 */
import "server-only";
import { hasDb } from "../db";
import { getInput, saveInput } from "../tools/server";
import { DEFAULT_AGENT_SETTINGS, parseAgentSettings, type AgentSettings } from "./autonomy";

export const AGENT_SETTINGS_KIND = "agent";

const g = globalThis as unknown as { __helixAgentSettings?: Map<string, AgentSettings> };
const mem = (g.__helixAgentSettings ??= new Map<string, AgentSettings>());

export async function getAgentSettings(userId: string): Promise<AgentSettings> {
  if (!hasDb) return mem.get(userId) ?? DEFAULT_AGENT_SETTINGS;
  const stored = await getInput<Partial<AgentSettings>>(userId, AGENT_SETTINGS_KIND, {});
  return parseAgentSettings(stored);
}

export async function saveAgentSettings(userId: string, input: Partial<AgentSettings>): Promise<AgentSettings> {
  const parsed = parseAgentSettings(input);
  if (!hasDb) mem.set(userId, parsed);
  else await saveInput(userId, AGENT_SETTINGS_KIND, parsed);
  return parsed;
}
