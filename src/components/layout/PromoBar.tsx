import Link from "next/link";
import { ExternalLink, FlaskConical, Scale, ShieldCheck, Snowflake } from "lucide-react";
import { IS_PREVIEW } from "@/lib/site";

export function PromoBar() {
  if (IS_PREVIEW) return <PreviewBar />;
  return (
    <div className="container pt-3">
      <div className="glass flex h-10 items-center justify-between gap-4 rounded-full px-4 text-xs font-medium text-navy-900/80 sm:px-5">
        <p className="flex min-w-0 items-center gap-2">
          <Snowflake className="h-3.5 w-3.5 shrink-0 text-ice-500" aria-hidden />
          <span className="font-semibold text-navy-900">Winter deals across top stores</span>
          <span className="hidden text-navy-900/30 sm:inline" aria-hidden>
            •
          </span>
          <span className="hidden truncate text-navy-900/60 sm:inline">Compare prices before you buy</span>
        </p>
        <ul className="hidden shrink-0 items-center gap-4 lg:flex">
          <li className="flex items-center gap-1.5">
            <Scale className="h-3.5 w-3.5 text-navy-900/60" aria-hidden /> Price comparison
          </li>
          <li className="flex items-center gap-1.5 border-l border-navy-900/10 pl-4">
            <ExternalLink className="h-3.5 w-3.5 text-navy-900/60" aria-hidden /> Buy on the store
          </li>
          <li className="flex items-center gap-1.5 border-l border-navy-900/10 pl-4">
            <ShieldCheck className="h-3.5 w-3.5 text-navy-900/60" aria-hidden /> Free to use
          </li>
        </ul>
      </div>
    </div>
  );
}

/** Shown on every page while the site runs on demonstration data. */
function PreviewBar() {
  return (
    <div className="container pt-3" role="note" aria-label="Preview notice">
      <div className="glass flex min-h-10 flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl px-4 py-2 text-center text-xs text-navy-900/80 sm:rounded-full sm:px-5">
        <span className="chip shrink-0 bg-lavender-100 px-2 py-0.5 text-[10px] uppercase tracking-wider text-lavender-600">
          <FlaskConical className="h-3 w-3" aria-hidden />
          Preview
        </span>
        <span>
          <span className="font-semibold text-navy-900">Not a working shopping service yet.</span>{" "}
          <span className="text-navy-900/70">All products, prices, discounts and ratings are demo data.</span>
        </span>
        <Link href="/info/about" className="font-semibold text-ice-500 underline-offset-2 hover:underline">
          Learn more
        </Link>
      </div>
    </div>
  );
}
