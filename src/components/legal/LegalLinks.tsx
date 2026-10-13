import Link from "next/link";

export function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      <Link className="underline hover:no-underline" href="/privacy">Privacy</Link>
      {" · "}
      <Link className="underline hover:no-underline" href="/terms">Terms</Link>
      {" · "}
      <Link className="underline hover:no-underline" href="/data-deletion">Data deletion</Link>
    </span>
  );
}
