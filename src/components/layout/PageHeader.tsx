import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

export function PageHeader({ title, description, crumbs }: { title: string; description?: string; crumbs: Crumb[] }) {
  return (
    <div>
      <div className="container pb-4 pt-10 md:pb-6 md:pt-14">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-[42px] md:leading-tight">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-navy-900/60">{description}</p>}
      </div>
    </div>
  );
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-navy-900/60">
        {crumbs.map((c, i) => (
          <li key={c.label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden />}
            {c.href ? (
              <Link href={c.href} className="hover:text-navy-900">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-navy-900/80">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
