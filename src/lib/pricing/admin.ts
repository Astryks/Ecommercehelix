/**
 * Finishing step — admin role for the all-orgs margin view.
 *
 * There is no admin column on User, so the role is a comma-separated list of
 * owner emails in the environment. Granting it is a Sid step:
 *   HELIX_ADMIN_EMAILS=sid@example.com
 * in Vercel (Settings -> Environment Variables), then redeploy. Until it is
 * set, the margin page shows only the viewer's own org — no one sees
 * another store's numbers.
 */
export function isHelixAdmin(email: string, env: Record<string, string | undefined> = process.env): boolean {
  const list = (env.HELIX_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return email.trim().toLowerCase() !== "" && list.includes(email.trim().toLowerCase());
}
