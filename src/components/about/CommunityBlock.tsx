import Link from "next/link";
import { auth } from "@/auth";
import { getAccount, getBilling } from "@/lib/repo";
import { communityAccess, type CommunityAccess } from "@/lib/fb-group/state";
import { groupUrl } from "@/lib/fb-group/links";

/** Works out access on the server. The link is only ever sent to paying members. */
export async function loadCommunityAccess(): Promise<CommunityAccess> {
  try {
    const s = await auth();
    const id = s?.user?.id;
    if (!id) return { kind: "locked" };
    const [acct, billing] = await Promise.all([getAccount(id), getBilling(id)]);
    return communityAccess({ plan: acct?.plan, status: billing?.status }, groupUrl());
  } catch {
    return { kind: "locked" };
  }
}

export function CommunityCard({ access }: { access: CommunityAccess }) {
  return (
    <section aria-labelledby="community-title" className="mt-block rounded-xl border border-cyan-100 bg-cyan-50/60 p-card">
      <h3 id="community-title" className="font-display text-xl font-semibold tracking-tight text-slate-900">Join our private Facebook community</h3>
      {access.kind === "member" && (
        <>
          <p className="mt-lead text-slate-700">A place for Helix members to share what works, share numbers and push each other.</p>
          <a href={access.url} target="_blank" rel="noopener noreferrer" className="mt-block inline-flex rounded-lg bg-cyan-600 px-5 py-2.5 font-semibold text-white hover:bg-cyan-700">Join the group</a>
        </>
      )}
      {access.kind === "soon" && <p className="mt-lead text-slate-700">Link coming soon.</p>}
      {access.kind === "locked" && (
        <>
          <p className="mt-lead text-slate-700">Members only, join Helix to get access.</p>
          <div className="mt-block flex flex-wrap gap-3">
            <Link href="/pricing" className="inline-flex rounded-lg bg-cyan-600 px-5 py-2.5 font-semibold text-white hover:bg-cyan-700">See pricing</Link>
            <Link href="/signin?next=%2Fabout" className="inline-flex rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-800 hover:bg-slate-50">Sign in</Link>
          </div>
        </>
      )}
    </section>
  );
}

export async function CommunityBlock() {
  return <CommunityCard access={await loadCommunityAccess()} />;
}
