"use client";

import { useId, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Offer } from "@/lib/types";
import { cn } from "@/lib/format";
import { merchantStyle } from "@/lib/merchants";

interface Props {
  offer: Offer;
  variant?: "primary" | "outline" | "store";
  size?: "md" | "sm";
  className?: string;
  label?: string;
}

/**
 * Outbound marketplace link. Real affiliate links open in a new tab with
 * rel="sponsored". Placeholder offers ("#") render as a clearly tagged demo
 * button that explains the store isn't connected yet.
 */
export function BuyButton({ offer, variant = "primary", size = "md", className, label }: Props) {
  const [notice, setNotice] = useState(false);
  const descId = useId();
  const placeholder = !offer.affiliateUrl || offer.affiliateUrl === "#";
  const disabled = offer.availability === "out_of_stock";
  const text = label ?? `Buy at ${offer.merchant}`;

  const classes = cn(
    variant === "primary" && "btn-primary",
    variant === "outline" && "btn-outline",
    variant === "store" && cn("btn rounded-xl", merchantStyle[offer.merchant].button),
    size === "sm" && "px-4 py-2 text-xs",
    "w-full",
    className
  );

  if (disabled) {
    return (
      <button type="button" disabled className={classes}>
        Out of stock
      </button>
    );
  }

  // Demo offers: a real <button> (no fake link), visibly tagged and announced as unavailable.
  if (placeholder) {
    return (
      <div className="relative w-full">
        <button
          type="button"
          aria-disabled="true"
          aria-describedby={descId}
          title={`Demo only — ${offer.merchant} affiliate link not connected yet`}
          className={cn(classes, "cursor-not-allowed saturate-[0.85]")}
          onClick={() => {
            setNotice(true);
            window.setTimeout(() => setNotice(false), 2800);
          }}
        >
          {text}
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ring-inset",
              variant === "outline" ? "bg-navy-900/5 text-navy-900/70 ring-navy-900/10" : "bg-white/25 ring-white/40"
            )}
          >
            Demo
          </span>
        </button>
        <span id={descId} className="sr-only">
          Demo button. The {offer.merchant} store link is not connected yet.
        </span>
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "absolute inset-x-0 bottom-full z-20 mb-2 rounded-lg bg-navy-900 px-2 py-1.5 text-center text-[11px] font-medium text-white shadow-lift",
            !notice && "sr-only"
          )}
        >
          {notice ? `Demo only — ${offer.merchant} isn't connected yet.` : ""}
        </p>
      </div>
    );
  }

  return (
    <a href={offer.affiliateUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className={classes}>
      {text}
      <ArrowUpRight className="h-4 w-4" aria-hidden />
    </a>
  );
}
