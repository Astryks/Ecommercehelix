/** Dashboard page heading: title, optional icon and one line about the page, on the shared spacing tokens. */
export function PageHeader({ title, icon, lead, actions }: { title: React.ReactNode; icon?: React.ReactNode; lead?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="page-title flex items-center gap-2">{icon}{title}</h1>
        {lead && <p className="page-lead">{lead}</p>}
      </div>
      {actions}
    </header>
  );
}
