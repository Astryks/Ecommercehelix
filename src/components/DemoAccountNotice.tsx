/** Shown to users created by the demo login, so nobody mistakes a test account for a real one. */
export function DemoAccountNotice({ className = "" }: { className?: string }) {
  return (
    <div className={"bg-amber-50 px-4 py-1.5 text-center text-xs font-semibold text-amber-900 " + className} role="note">
      Demo account: a separate test account made just for this sign-in. It is not linked to any email, and signing out ends it.
    </div>
  );
}
