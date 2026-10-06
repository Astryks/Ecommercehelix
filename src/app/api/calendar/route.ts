import { type NextRequest } from "next/server";
import { isoDay } from "@/lib/dates";
import { buildIcs } from "@/lib/ics";
import { appUrl } from "@/lib/meta/config";
import { toCountry } from "@/lib/seasons";

export const dynamic = "force-dynamic";

/** Public .ics feed of key retail dates. ?country=AU|US, ?download=1 for a file download. Safe to subscribe to (no user data). */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const country = toCountry(url.searchParams.get("country"));
  const body = buildIcs(isoDay(), country, { baseUrl: appUrl(url.origin) });
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      ...(url.searchParams.get("download") ? { "Content-Disposition": `attachment; filename="helix-key-dates-${country.toLowerCase()}.ics"` } : {}),
    },
  });
}
