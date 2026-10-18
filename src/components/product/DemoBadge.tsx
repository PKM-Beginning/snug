import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/format";

export function DemoBadge({ className, label = "Demo data" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn("chip border border-dashed border-lavender-300 bg-lavender-50 text-[11px] text-navy-700", className)}
      title="Mock marketplace data for development — not real prices"
    >
      <FlaskConical className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}

export function DemoNotice({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-start gap-2 rounded-xl border border-dashed border-lavender-300 bg-lavender-50 px-4 py-3 text-xs text-navy-800", className)}>
      <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>
        <strong className="font-semibold">Demo catalogue.</strong> Products, brands, prices and store offers on this page
        are mock data for development. They are not live Amazon, Flipkart or Myntra listings.
      </span>
    </p>
  );
}
