/**
 * Page heading for public pages, on the shared spacing tokens.
 * Only pass an eyebrow when it adds something the title does not already say.
 */
export function PageHero({ eyebrow, title, lead, center = false, className = "", children }: {
  eyebrow?: React.ReactNode; title: React.ReactNode; lead?: React.ReactNode; center?: boolean; className?: string; children?: React.ReactNode;
}) {
  return (
    <header className={`${center ? "text-center" : ""} ${className}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className={`${eyebrow ? "mt-eyebrow" : ""} text-4xl text-slate-900 sm:text-5xl`}>{title}</h1>
      {lead && <div className={`mt-lead ${center ? "mx-auto" : ""} max-w-2xl text-lg leading-8 text-slate-600`}>{lead}</div>}
      {children}
    </header>
  );
}
