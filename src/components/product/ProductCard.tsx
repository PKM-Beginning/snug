import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import type { Product } from "@/lib/types";
import { bestOffer, purchasableOffers } from "@/lib/filters";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "./ProductImage";
import { Rating } from "./Rating";
import { WishlistButton } from "./WishlistButton";
import { StoreMark } from "./StoreMark";
import { BuyButton } from "./BuyButton";

const TINTS = [
  "from-lavender-100 to-ice-100",
  "from-ember-50 to-lavender-50",
  "from-ice-100 to-ice-50",
  "from-rose-50 to-lavender-100",
];

/**
 * The whole card links to the product page (stretched link). The store button
 * sits above that link and goes straight to the cheapest offer.
 */
export function ProductCard({ product, priority, index = 0 }: { product: Product; priority?: boolean; index?: number }) {
  const best = bestOffer(product);
  const storeCount = purchasableOffers(product).length;
  const multiStore = storeCount > 1;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-navy-900/[0.07] bg-white shadow-card transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className={`relative aspect-[5/4] overflow-hidden bg-gradient-to-br ${TINTS[index % TINTS.length]}`}>
        <ProductImage
          src={product.image}
          alt={product.name}
          sizes="(min-width: 1280px) 18vw, (min-width: 768px) 30vw, 48vw"
          priority={priority}
          className="transition-transform duration-300 group-hover:scale-[1.04]"
        />
        {product.discount > 0 && (
          <span className="chip absolute left-2.5 top-2.5 bg-ember-500 text-white shadow-sm">-{product.discount}%</span>
        )}
        <WishlistButton id={product.id} name={product.name} className="absolute right-2.5 top-2.5 z-10 h-8 w-8" />
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          {product.rating !== null ? <Rating value={product.rating} count={product.reviewCount ?? undefined} demo={product.isDemo} /> : <span />}
          {multiStore && (
            <span className="inline-flex items-center gap-0.5 whitespace-nowrap text-[10px] font-semibold text-emerald-700" title={`Lowest of ${storeCount} stores`}>
              <BadgeCheck className="h-3 w-3" aria-hidden />
              Best Price
            </span>
          )}
        </div>
        <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug">
          <Link href={`/products/${product.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {product.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-[11px] text-navy-900/60">{product.brand}</p>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-base font-bold sm:text-lg">{formatPrice(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-xs text-navy-900/60 line-through">{formatPrice(product.mrp)}</span>
          )}
          {product.discount > 0 && <span className="text-[11px] font-semibold text-ember-600">{product.discount}% off</span>}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <StoreMark merchant={best.merchant} />
          {multiStore && <span className="text-[11px] text-navy-900/60">+{storeCount - 1} more</span>}
        </div>

        <div className="relative z-10 mt-auto pt-3">
          <BuyButton offer={best} variant="store" size="sm" label={`Buy on ${best.merchant}`} />
        </div>
      </div>
    </article>
  );
}
