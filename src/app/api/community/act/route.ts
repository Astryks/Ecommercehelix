import { NextResponse, type NextRequest } from "next/server";
import { addGroupEvent, groupPeople } from "@/lib/fb-group/store";
import { approveUrl, groupUrl, removeUrl, verifyGroupLink } from "@/lib/fb-group/links";

export const dynamic = "force-dynamic";

/** One-tap link from the owner email: mark the person done in Helix, then open the right Facebook page. */
export async function GET(req: NextRequest) {
  const v = verifyGroupLink(req.nextUrl.searchParams.get("t") ?? "", process.env.AUTH_SECRET ?? "");
  if (!v.ok) return new NextResponse(v.reason === "expired" ? "This link has expired. Open the dashboard instead: /admin/community" : "This link is not valid.", { status: v.reason === "expired" ? 410 : 400 });
  const person = (await groupPeople()).find((p) => p.userId === v.userId);
  // Only act when the person is still waiting for this exact action (a second tap does nothing new).
  if (person && person.status === v.action) await addGroupEvent(v.userId, v.action === "approve" ? "approved" : "removed", "owner-link");
  const g = groupUrl();
  if (!g) return NextResponse.redirect(new URL("/admin/community", req.url));
  return NextResponse.redirect(v.action === "approve" ? approveUrl(g) : removeUrl(g, person?.name ?? ""));
}
