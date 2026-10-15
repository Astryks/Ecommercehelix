import { hasDb } from "../db";
import { isModerator } from "../community";

/** Owner-only: the existing moderator list (WINS_MODERATORS). The local demo (no database) can preview with ADMIN_DEMO=1. */
export function isGroupAdmin(email: string | null | undefined, env: Record<string, string | undefined> = process.env): boolean {
  if (isModerator(email, env)) return true;
  return !hasDb && env.ADMIN_DEMO === "1" && env.NODE_ENV !== "test" && !env.VERCEL;
}
