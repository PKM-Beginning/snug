import type { Availability, Merchant } from "@/lib/types";

/**
 * Generic colours and monograms only — not marketplace logos. Swap in
 * official badges only after reviewing each affiliate programme's
 * brand-usage guidelines.
 */
export const merchantStyle: Record<Merchant, { dot: string; mark: string; button: string; initial: string }> = {
  Amazon: {
    dot: "bg-amber-500",
    mark: "bg-navy-900 text-amber-300",
    button: "bg-navy-900 text-white hover:bg-navy-800",
    initial: "A",
  },
  Flipkart: {
    dot: "bg-blue-600",
    mark: "bg-blue-600 text-yellow-300",
    button: "bg-blue-600 text-white hover:bg-blue-700",
    initial: "F",
  },
  Myntra: {
    dot: "bg-fuchsia-600",
    mark: "bg-gradient-to-br from-fuchsia-600 to-rose-500 text-white",
    button: "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white hover:brightness-110",
    initial: "M",
  },
};

export const availabilityLabel: Record<Availability, { text: string; className: string }> = {
  in_stock: { text: "In stock", className: "text-emerald-700" },
  low_stock: { text: "Few left", className: "text-amber-700" },
  out_of_stock: { text: "Out of stock", className: "text-slate-400" },
};
