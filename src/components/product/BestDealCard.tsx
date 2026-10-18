import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { bestOffer } from "@/lib/filters";
import { cn, formatPrice } from "@/lib/format";
import { ProductImage } from "./ProductImage";
import { BuyButton } from "./BuyButton";
import { DemoBadge } from "./DemoBadge";
import { Rating } from "./Rating";
import { StoreMark } from "./StoreMark";

/**
 * Multi-store comparison card. `wide` = product on the left, price table on
 * the right (stacks on mobile). Compact = vertical card for grids.
 */
export function BestDealCard({ product, wide = false }: { product: Product; wide?: boolean }) {
  const best = bestOffer(product);
  const offers = [...product.offers].sort((a, b) => a.price - b.price);
  const highest = Math.max(...offers.filter((o) => o.availability !== "out_of_stock").map((o) => o.price));
  const saving = highest - best.price;

  return (
    <article className={cn("panel grid gap-4 p-4 sm:p-5", wide && "md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-6")}>
      <div className="flex gap-4">
        <div className="relative h-32 w-28 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-ice-100 to-lavender-100 sm:h-36 sm:w-32">
          <ProductImage src={product.image} alt={product.name} sizes="128px" />
          <span className="chip absolute left-1.5 top-1.5 bg-ember-500 text-[10px] text-white">
            <Star className="h-2.5 w-2.5 fill-current" aria-hidden />
            Best deal
          </span>
        </div>
        <div className="min-w-0 flex-1 py-1">
          <DemoBadge />
          <h3 className="mt-2 line-clamp-2 font-semibold leading-snug">
            <Link href={`/products/${product.id}`} className="hover:text-ice-500">
              {product.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-navy-900/60">{product.brand}</p>
          {product.rating !== null && (
            <div className="mt-2">
              <Rating value={product.rating} count={product.reviewCount ?? undefined} demo={product.isDemo} />
            </div>
          )}
          <p className="mt-3 text-xs text-navy-900/65">
            Best price <span className="block text-xl font-bold text-navy-900">{formatPrice(best.price)}</span>
          </p>
          {saving > 0 && <p className="text-xs font-semibold text-emerald-700">Save {formatPrice(saving)} vs highest store</p>}
        </div>
      </div>

      <div className="rounded-xl border border-navy-900/5 bg-ice-50/60">
        <p className="border-b border-navy-900/5 px-3 py-2.5 text-xs font-semibold text-navy-900/70">Compare prices across stores</p>
        <ul aria-label="Store prices">
          {offers.map((o) => {
            const isBest = o === best;
            const oos = o.availability === "out_of_stock";
            return (
              <li
                key={o.merchant}
                className={cn(
                  "grid grid-cols-[1fr_auto] items-center gap-2 border-b border-navy-900/5 px-3 py-2.5 last:border-0 sm:grid-cols-[1fr_auto_7.5rem]",
                  isBest && "bg-white"
                )}
              >
                <span className="flex items-center gap-2">
                  <StoreMark merchant={o.merchant} />
                  {isBest && (
                    <span className="chip bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
                      <BadgeCheck className="h-3 w-3" aria-hidden /> Lowest
                    </span>
                  )}
                </span>
                <span className={cn("text-sm font-bold", oos && "font-medium text-navy-900/60 line-through")}>
                  {formatPrice(o.price)}
                </span>
                <div className="col-span-2 sm:col-span-1">
                  <BuyButton offer={o} size="sm" variant={isBest ? "primary" : "outline"} label={isBest ? `Buy at ${o.merchant}` : "View"} className="py-1.5" />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}
