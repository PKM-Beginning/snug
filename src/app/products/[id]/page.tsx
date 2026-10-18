import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, ShieldCheck, Snowflake, Store } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { ProductImage } from "@/components/product/ProductImage";
import { Rating } from "@/components/product/Rating";
import { BuyButton } from "@/components/product/BuyButton";
import { WishlistButton } from "@/components/product/WishlistButton";
import { OfferComparison } from "@/components/product/OfferComparison";
import { ProductGrid } from "@/components/product/ProductGrid";
import { DemoBadge } from "@/components/product/DemoBadge";
import { SectionHeader } from "@/components/home/SectionHeader";
import { getProductById, getRelatedProducts } from "@/lib/catalog";
import { categories } from "@/lib/data/categories";
import { bestOffer, purchasableOffers } from "@/lib/filters";
import { formatPrice } from "@/lib/format";

// Rendered per request (no generateStaticParams): in live mode prices must
// never be served from a stale page cache. Unknown slugs return HTTP 404 —
// the listing's loading.tsx lives in the (list) route group so it doesn't wrap this page.

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProductById((await params).id);
  if (!product) return { title: "Product not found" };
  const title = `${product.name} by ${product.brand}`;
  return {
    title,
    description: `${product.description.slice(0, 140)} Compare offers from ${product.offers.length} stores.`,
    alternates: { canonical: `/products/${product.id}` },
    // SVG placeholders aren't valid OG images; fall back to the site-wide image.
    openGraph: { title, ...(product.image.endsWith(".svg") ? {} : { images: [{ url: product.image }] }) },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const product = await getProductById((await params).id);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const best = bestOffer(product);
  const stores = purchasableOffers(product).length;
  const category = categories.find((c) => c.slug === product.category);
  const savings = product.mrp - product.price;

  return (
    <>
      <div className="container py-6 md:py-10">
        <Breadcrumbs
          crumbs={[
            { label: "Home", href: "/" },
            { label: category?.name ?? "Products", href: `/category/${product.category}` },
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-ice-50 lg:sticky lg:top-24">
              <ProductImage src={product.image} alt={product.name} sizes="(min-width:1024px) 45vw, 100vw" priority />
              {product.discount > 0 && (
                <span className="chip absolute left-4 top-4 bg-ember-500 px-3 py-1.5 text-sm text-white">-{product.discount}%</span>
              )}
              <WishlistButton id={product.id} name={product.name} className="absolute right-4 top-4 h-11 w-11" />
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-900/60">{product.brand}</p>
              {product.isDemo && <DemoBadge />}
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">{product.name}</h1>
            {product.rating !== null && (
              <div className="mt-3">
                <Rating value={product.rating} count={product.reviewCount ?? undefined} size="md" demo={product.isDemo} />
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
              <span className="text-navy-900/60 line-through">MRP {formatPrice(product.mrp)}</span>
              <span className="chip bg-ember-100 text-ember-700">{product.discount}% off</span>
            </div>
            {savings > 0 && <p className="mt-1 text-sm text-emerald-700">You save {formatPrice(savings)} vs MRP</p>}

            {/* Best offer box */}
            <div className="mt-6 rounded-2xl border border-ice-200 bg-ice-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-navy-900/60">Best available offer</p>
              <div className="mt-2 flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">
                    {formatPrice(best.price)} <span className="font-normal text-navy-900/60">at {best.merchant}</span>
                  </p>
                  <p className="text-xs text-navy-900/60">
                    Lowest of {stores} {stores === 1 ? "store" : "stores"} in stock
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <BuyButton offer={best} />
              </div>
            </div>

            <div className="mt-8">
              <h2 className="font-semibold">About this item</h2>
              <p className="mt-2 leading-relaxed text-navy-900/70">{product.description}</p>
              {product.highlights.length > 0 && <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-navy-900/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-ice-500" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>}
            </div>

            <dl className="mt-8 grid grid-cols-3 gap-3 text-center">
              <Fact icon={<Snowflake className="h-4 w-4" />} label="Winter score" value={`${product.winterScore}/100`} />
              <Fact icon={<Store className="h-4 w-4" />} label="Stores" value={String(product.offers.length)} />
              <Fact icon={<ShieldCheck className="h-4 w-4" />} label="Checkout" value="On store" />
            </dl>
          </div>
        </div>

        <div className="mt-12">
          <OfferComparison product={product} />
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading">
          <div className="section">
            <SectionHeader id="related-heading" title="You might also like" href={`/category/${product.category}`} />
            <ProductGrid products={related} columns={4} />
          </div>
        </section>
      )}
    </>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-navy-900/5 bg-white p-3">
      <dt className="flex items-center justify-center gap-1 text-[11px] text-navy-900/60">
        <span aria-hidden>{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}
