import { Clock } from "lucide-react";
import type { Product } from "@/lib/types";
import { bestOffer } from "@/lib/filters";
import { cn, formatPrice, formatUpdated } from "@/lib/format";
import { availabilityLabel } from "@/lib/merchants";
import { StoreMark } from "./StoreMark";
import { BuyButton } from "./BuyButton";
import { DemoBadge } from "./DemoBadge";

/** Table on md+, stacked cards on mobile. Cheapest purchasable offer is highlighted. */
export function OfferComparison({ product }: { product: Product }) {
  const best = bestOffer(product);
  const offers = [...product.offers].sort((a, b) => {
    const ao = a.availability === "out_of_stock" ? 1 : 0;
    const bo = b.availability === "out_of_stock" ? 1 : 0;
    return ao - bo || a.price - b.price;
  });

  return (
    <section aria-labelledby="compare-heading" className="rounded-2xl border border-navy-900/5 bg-white p-4 shadow-card sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="compare-heading" className="text-lg font-semibold">
          Compare {offers.length} {offers.length === 1 ? "offer" : "offers"}
        </h2>
        {product.isDemo && <DemoBadge />}
      </div>

      {/* Desktop table */}
      <table className="hidden w-full text-sm md:table">
        <caption className="sr-only">Store offers for {product.name}</caption>
        <thead>
          <tr className="border-b border-navy-900/10 text-left text-xs uppercase tracking-wider text-navy-900/60">
            <th scope="col" className="pb-3 font-semibold">Store</th>
            <th scope="col" className="pb-3 font-semibold">Price</th>
            <th scope="col" className="pb-3 font-semibold">Availability</th>
            <th scope="col" className="pb-3 font-semibold">Updated</th>
            <th scope="col" className="pb-3"><span className="sr-only">Action</span></th>
          </tr>
        </thead>
        <tbody>
          {offers.map((o) => {
            const isBest = o === best;
            const av = availabilityLabel[o.availability];
            return (
              <tr key={o.merchant} className={cn("border-b border-navy-900/5 last:border-0", isBest && "bg-ice-50")}>
                <td className="py-4 pl-2">
                  <span className="flex items-center gap-2 font-semibold">
                    <StoreMark merchant={o.merchant} size="md" />
                    {isBest && <span className="chip bg-ember-100 text-ember-700">Best price</span>}
                  </span>
                </td>
                <td className={cn("py-4 text-base font-bold", o.availability === "out_of_stock" && "text-navy-900/60")}>
                  {formatPrice(o.price)}
                </td>
                <td className={cn("py-4 text-sm font-medium", av.className)}>{av.text}</td>
                <td className="py-4 text-xs text-navy-900/60">{formatUpdated(o.lastUpdated)}</td>
                <td className="w-44 py-4 pr-2">
                  <BuyButton offer={o} size="sm" variant={isBest ? "primary" : "outline"} label={`Go to ${o.merchant}`} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {offers.map((o) => {
          const isBest = o === best;
          const av = availabilityLabel[o.availability];
          return (
            <li
              key={o.merchant}
              className={cn("rounded-xl border p-4", isBest ? "border-ice-300 bg-ice-50" : "border-navy-900/10")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 font-semibold">
                    <StoreMark merchant={o.merchant} size="md" />
                  </p>
                  <p className={cn("mt-1 text-xs font-medium", av.className)}>{av.text}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatPrice(o.price)}</p>
                  {isBest && <span className="chip mt-1 bg-ember-100 text-ember-700">Best price</span>}
                </div>
              </div>
              <p className="mt-2 flex items-center gap-1 text-[11px] text-navy-900/60">
                <Clock className="h-3 w-3" aria-hidden /> Updated {formatUpdated(o.lastUpdated)}
              </p>
              <div className="mt-3">
                <BuyButton offer={o} size="sm" variant={isBest ? "primary" : "outline"} />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs text-navy-900/60">
        Prices and stock are set by each store and may change. Confirm the final price on the store before buying.
      </p>
    </section>
  );
}
