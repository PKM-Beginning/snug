import { Flame, Star, Wallet } from "lucide-react";
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

      <HowItWorks />
      <TrustSection />
    </>
  );
}
