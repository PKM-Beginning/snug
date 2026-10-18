import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatPrice } from "@/lib/format";

interface Props {
  max: number;
  note: string;
  count: number;
  index: number;
}

const styles = [
  "bg-ice-100 hover:bg-ice-200",
  "bg-lavender-100 hover:bg-lavender-200",
  "bg-ember-50 hover:bg-ember-100",
  "bg-navy-900 text-white hover:bg-navy-800",
];

export function BudgetCard({ max, note, count, index }: Props) {
  const dark = index === 3;
  return (
    <Link
      href={`/products?maxPrice=${max}`}
      className={`group flex h-full flex-col justify-between rounded-2xl p-5 transition-colors sm:p-6 ${styles[index % 4]}`}
    >
      <div className="flex items-start justify-between">
        <p className={`text-xs font-semibold uppercase tracking-wider ${dark ? "text-ice-300" : "text-navy-900/60"}`}>Under</p>
        <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
      </div>
      <div className="mt-8">
        <p className="font-display text-3xl font-bold sm:text-4xl">{formatPrice(max)}</p>
        <p className={`mt-1 text-sm ${dark ? "text-ice-100/70" : "text-navy-900/60"}`}>{note}</p>
        <p className={`mt-3 text-xs font-semibold ${dark ? "text-ice-200" : "text-navy-900/70"}`}>{count} picks</p>
      </div>
    </Link>
  );
}
