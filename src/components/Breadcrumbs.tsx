import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export function Breadcrumbs({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <ol className="flex flex-wrap gap-2">
          {trail.map((t, i) => (
            <li key={t.path} className="flex gap-2">
              {i > 0 && <span aria-hidden>/</span>}
              {i < trail.length - 1 ? <Link className="hover:text-slate-900" href={t.path}>{t.name}</Link> : <span aria-current="page">{t.name}</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(trail)} />
    </>
  );
}
