import type { Merchant } from "@/lib/types";
import { merchantStyle } from "@/lib/merchants";
import { cn } from "@/lib/format";

/** Monogram + store name. Deliberately not the marketplace's logo. */
export function StoreMark({ merchant, size = "sm", showName = true, className }: { merchant: Merchant; size?: "sm" | "md"; showName?: boolean; className?: string }) {
  const s = merchantStyle[merchant];
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-md font-display font-bold",
          size === "md" ? "h-7 w-7 text-sm" : "h-5 w-5 text-[11px]",
          s.mark
        )}
        aria-hidden
      >
        {s.initial}
      </span>
      {showName && <span className={size === "md" ? "text-sm font-semibold" : "text-xs font-medium"}>{merchant}</span>}
    </span>
  );
}
