import { Star } from "lucide-react";
import { formatCount } from "@/lib/format";

/** `demo` marks the rating as demonstration data (not from real customers). */
export function Rating({ value, count, size = "sm", demo = false }: { value: number; count?: number; size?: "sm" | "md"; demo?: boolean }) {
  const icon = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div
      className={`flex items-center gap-1 ${size === "md" ? "text-sm" : "text-xs"}`}
      aria-label={demo ? `Demo rating ${value} out of 5 — not from real customers` : `Rated ${value} out of 5${count ? ` from ${count} reviews` : ""}`}
      title={demo ? "Demo rating — not from real customers" : undefined}
    >
      <Star className={`${icon} fill-amber-400 text-amber-400`} aria-hidden />
      <span className="font-semibold text-navy-900">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-navy-900/60">({formatCount(count)})</span>}
      {demo && <span className="rounded bg-lavender-100 px-1 text-[9px] font-bold uppercase tracking-wider text-lavender-600">Demo</span>}
    </div>
  );
}
