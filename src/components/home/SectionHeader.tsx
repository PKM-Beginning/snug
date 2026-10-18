import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  id?: string;
  aside?: React.ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;
}

export function SectionHeader({ eyebrow, title, description, href, linkLabel = "View all", id, aside, icon: Icon, iconClassName = "text-ice-500" }: Props) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 md:mb-6">
      <div className="max-w-xl">
        {eyebrow && <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ice-500">{eyebrow}</p>}
        <h2 id={id} className="flex items-center gap-2 font-display text-xl font-bold tracking-tight md:text-[26px]">
          {Icon && <Icon className={`h-6 w-6 shrink-0 ${iconClassName}`} aria-hidden />}
          {title}
        </h2>
        {description && <p className="mt-1.5 text-sm text-navy-900/60">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        {aside}
        {href && (
          <Link href={href} className="group inline-flex items-center gap-1 text-sm font-semibold text-ice-500 hover:text-lavender-600">
            {linkLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
