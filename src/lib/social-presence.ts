/**
 * Finishing step — social presence pull (Instagram + Facebook via the
 * owner's existing Meta token; TikTok profile data is NOT pulled — see below).
 *
 * Runs weekly from /api/cron/social-presence. Read-only Graph calls:
 *   /me/accounts -> pages + linked Instagram business account
 *   /{ig-id}?fields=username,biography,website,followers_count,media_count
 *   /{ig-id}/media?fields=timestamp,caption&limit=10
 *   /{page-id}/posts?fields=created_time,message&limit=1
 * No scraping: Instagram/TikTok public pages are JS-gated and block bots,
 * so the only honest source is the platform API with the owner's token.
 *
 * What Graph CANNOT report (neutral values, never invented gaps):
 * - Instagram highlights and pinned posts are not in the Graph API, so
 *   highlights is set to 3 and pinned to 1 (rule-neutral) and the Insights
 *   page says those two checks are manual.
 * - Unanswered questions need comment reads — not pulled; 0 (rule-neutral).
 * - TikTok: the TikTok Ads token is advertiser-level, not a user profile
 *   token. A TikTok profile pull needs TikTok Login Kit OAuth
 *   (user.info.basic + video.list scopes) — a Sid step, recorded in
 *   STATUS.md. Until then TikTok has no profile in this data.
 */
import "server-only";
import { decrypt, loadKey } from "./crypto";
import { getSnapshot, getConnection } from "./meta/store";
import { createGraph } from "./meta/graph";
import { metaMode, type MetaMode } from "./meta/config";
import { getInput, saveInput } from "./tools/server";
import type { SocialProfile } from "./social-profile";
import { fbProfileFromGraph, igProfileFromGraph, offerOnProfile } from "./social-profile";

export type SocialPresence = { fetchedAt: string; profiles: SocialProfile[]; liveAdOfferOnProfile: boolean; liveAdOffer: string };
const PRESENCE_KIND = "social-presence";

export async function getSocialPresence(userId: string): Promise<SocialPresence | null> {
  return getInput<SocialPresence | null>(userId, PRESENCE_KIND, null);
}

const aad = (userId: string) => `meta:${userId}`;
const keyFor = (mode: MetaMode) => loadKey(process.env.TOKEN_ENCRYPTION_KEY, mode === "mock");

/** Weekly pull. Returns null when Meta is not connected; per-profile failures are skipped, never faked. */
export async function fetchSocialPresence(userId: string): Promise<SocialPresence | null> {
  const conn = await getConnection(userId);
  if (!conn) return null;
  const mode = metaMode();
  const token = decrypt(conn.tokenEnc, keyFor(conn.mode), aad(userId));
  const g = createGraph({ token, appSecret: mode === "live" ? process.env.META_APP_SECRET : undefined });
  const accounts = await g.get<{ data?: { id: string; name: string; instagram_business_account?: { id: string } }[] }>("me/accounts", { fields: "id,name,instagram_business_account{id}" }).catch(() => null);
  const profiles: SocialProfile[] = [];
  const texts: string[] = [];
  for (const page of accounts?.data ?? []) {
    const igId = page.instagram_business_account?.id;
    if (igId) {
      try {
        const ig = await g.get<{ username?: string; biography?: string; website?: string; followers_count?: number; media_count?: number }>(igId, { fields: "username,biography,website,followers_count,media_count" });
        const media = await g.getAll<{ timestamp?: string; caption?: string }>(`${igId}/media`, { fields: "timestamp,caption", limit: 10 }, 1);
        profiles.push(igProfileFromGraph(ig, media));
        texts.push(ig.biography ?? "", ...media.map((m) => m.caption ?? ""));
      } catch { /* one profile failing must not block the others */ }
    }
    try {
      const posts = await g.getAll<{ created_time?: string; message?: string }>(`${page.id}/posts`, { fields: "created_time,message", limit: 1 }, 1);
      profiles.push(fbProfileFromGraph(page, posts[0]?.created_time ?? null));
      texts.push(posts[0]?.message ?? "");
    } catch { /* skip */ }
  }
  const snap = await getSnapshot(userId).catch(() => null);
  const live = (snap?.campaigns ?? []).find((c) => c.status === "Active");
  const liveAdOffer = live?.name ?? "";
  const presence: SocialPresence = {
    fetchedAt: new Date().toISOString(),
    profiles,
    liveAdOffer,
    liveAdOfferOnProfile: offerOnProfile(liveAdOffer, texts),
  };
  await saveInput(userId, PRESENCE_KIND, presence);
  return presence;
}
