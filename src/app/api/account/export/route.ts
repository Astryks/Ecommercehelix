import { requireUser } from "@/lib/session";
import { exportAccount } from "@/lib/repo";

export async function GET() {
  const u = await requireUser();
  const data = await exportAccount(u.id);
  return new Response(JSON.stringify(data, null, 2), {
    headers: { "content-type": "application/json", "content-disposition": `attachment; filename="helix-my-data-${new Date().toISOString().slice(0, 10)}.json"`, "cache-control": "no-store" },
  });
}
