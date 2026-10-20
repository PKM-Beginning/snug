import { BookOpen, ArrowRight, Flame, Star, Wallet } from "lucide-react";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { SectionHeader } from "@/components/home/SectionHeader";
import { CategoryRail } from "@/components/home/CategoryRail";
import { BudgetCard } from "@/components/home/BudgetCard";
import { DealBanner } from "@/components/home/DealBanner";
import { PromoBanner } from "@/components/home/PromoBanner";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustSection } from "@/components/home/TrustSection";
import { ProductGrid } from "@/components/product/ProductGrid";
import { BestDealCard } from "@/components/product/BestDealCard";
import { DemoBadge } from "@/components/product/DemoBadge";
import { budgetTiers } from "@/lib/data/categories";
import { BANNERS, bannerPhoto, heroPhoto } from "@/lib/assets";
import { renderAtRequestTimeInLiveMode } from "@/lib/config";
import { getAllProducts, getCategories, getMultiOfferDeals, getProductById, getProductsUnder, getTrendingProducts } from "@/lib/catalog";
import type { Product } from "@/lib/types";

const HERO_IDS = ["northvale-mens-puffer-jacket", "hearth-unisex-ribbed-beanie", "cinder-knit-womens-turtleneck"];
// Hero photo: public/images/hero/snug-hero.(webp|jpg|png). See src/lib/assets.ts.
// (The old /images/hero/hero.jpg screenshot is intentionally never referenced.)
// Where the subjects sit in the frame; adjust so faces stay clear of the glass panel.
const HERO_PHOTO_POSITION = "60% 22%";

export default async function HomePage() {
  await renderAtRequestTimeInLiveMode();
  const [all, trending, under999, bestDeals, heroItems, categories] = await Promise.all([
    getAllProducts(),
    getTrendingProducts(10),
    getProductsUnder(999, 5),
    getMultiOfferDeals(3),
    Promise.all(HERO_IDS.map(getProductById)),
    getCategories(),
  ]);

  const categoryCounts = Object.fromEntries(categories.map((c) => [c.slug, all.filter((p) => p.category === c.slug).length]));
  const [featuredDeal, ...otherDeals] = bestDeals;
  const cheapest = Math.min(...all.map((p) => p.price));

  return (
    <>
      <Hero
        featured={heroItems.filter((p): p is Product => Boolean(p))}
        maxDiscount={Math.max(...all.map((p) => p.discount))}
        heroImage={heroPhoto()}
        heroImagePosition={HERO_PHOTO_POSITION}
      />

      <section aria-labelledby="cat-heading" className="container pb-8 md:pb-12">
        <SectionHeader id="cat-heading" title="Shop by category" href="/products" />
        <CategoryRail categories={categories} counts={categoryCounts} />
      </section>

      <section aria-labelledby="trending-heading" className="section">
        <SectionHeader
          id="trending-heading"
          title="Trending winter deals"
          icon={Flame}
          iconClassName="text-ember-500"
          href="/deals"
          aside={<DemoBadge />}
        />
        <ProductGrid products={trending} columns={5} mobileLimit={6} />
      </section>

      <section aria-labelledby="under999-heading" className="section">
        <DealBanner
          eyebrow="Budget picks"
          title="Winter Under ₹999"
          subtitle="Cosy layers. Easy prices."
          cta="Shop now"
          href="/products?maxPrice=999&sort=discount_desc"
          fromPrice={cheapest}
          photo={bannerPhoto(BANNERS.under999)}
          images={[
            "/images/placeholders/sweaters-sand.svg",
            "/images/placeholders/accessories-charcoal.svg",
            "/images/placeholders/accessories-rust.svg",
          ]}
        />
        <h2 id="under999-heading" className="sr-only">
          Winter under ₹999
        </h2>
        <div className="mt-5">
          <ProductGrid products={under999} columns={5} mobileLimit={4} />
        </div>
      </section>

      <section aria-labelledby="best-heading" className="section">
        <SectionHeader
          id="best-heading"
          title="Best deals today"
          icon={Star}
          iconClassName="fill-ice-500 text-ice-500"
          description="Same product, different stores — the lowest price is highlighted."
          href="/deals"
        />
        <div className="space-y-4">
          {featuredDeal && <BestDealCard product={featuredDeal} wide />}
          {otherDeals.length > 0 && (
            <ul className="grid gap-4 lg:grid-cols-2">
              {otherDeals.map((p) => (
                <li key={p.id}>
                  <BestDealCard product={p} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section aria-labelledby="budget-heading" className="section">
        <SectionHeader id="budget-heading" title="Shop by budget" icon={Wallet} />
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {budgetTiers.map((b, i) => (
            <li key={b.max}>
              <BudgetCard max={b.max} note={b.note} index={i} count={all.filter((p) => p.price < b.max).length} />
            </li>
          ))}
        </ul>
      </section>

      <PromoBanner
        title="Build Your Winter Wardrobe"
        subtitle="Warm layers. Better prices."
        cta="Explore Collection"
        href="/products"
        photo={bannerPhoto(BANNERS.wardrobe)}
        images={[
          "/images/placeholders/sweaters-sand.svg",
          "/images/placeholders/jackets-navy.svg",
          "/images/placeholders/accessories-rust.svg",
        ]}
      />

      
      {/* Snug Buying Guides */}
      <section
        aria-labelledby="guides-heading"
        className="section"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
              <BookOpen className="h-4 w-4" />
              Snug Style Journal
            </div>

            <h2
              id="guides-heading"
              className="text-2xl font-bold text-navy-900 sm:text-3xl"
            >
              Winter Style & Buying Guides
            </h2>

            <p className="mt-2 text-sm text-navy-900/60 sm:text-base">
              Smart tips for staying warm, looking good and spending less.
            </p>
          </div>
        </div>

        <Link
          href="/guides/winter-jackets-under-1500"
          className="group block overflow-hidden rounded-3xl border border-white/70 bg-white/75 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="grid md:grid-cols-5">
            {/* Editorial visual */}
            <div className="relative flex min-h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-100 to-violet-200 p-8 md:col-span-2">
              <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/30 blur-2xl" />
              <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-blue-400/20 blur-2xl" />

              <div className="relative text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/60 shadow-lg backdrop-blur-md">
                  <BookOpen className="h-10 w-10 text-blue-600" />
                </div>
                <span className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-blue-700">
                  2026 Winter Guide
                </span>
              </div>
            </div>

            {/* Guide content */}
            <div className="flex flex-col justify-center p-6 sm:p-8 md:col-span-3 lg:p-10">
              <span className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-600">
                Winter Shopping Guide
              </span>

              <h3 className="text-2xl font-bold leading-tight text-navy-900 sm:text-3xl">
                Best Winter Jackets Under ₹1,500 in India
              </h3>

              <p className="mt-4 max-w-xl leading-7 text-navy-900/65">
                Not sure which jacket to buy? Explore fleece,
                padded jackets, windcheaters and practical tips
                for choosing warmth, comfort and value on a budget.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-600 transition-all group-hover:gap-3">
                Read Buying Guide
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </Link>
      </section>

      <HowItWorks />
      <TrustSection />

    </>
  );
}
