import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Catalog } from "@/components/catalog/Catalog";
import { BestDealCard } from "@/components/product/BestDealCard";
import { DemoNotice } from "@/components/product/DemoBadge";
import { SectionHeader } from "@/components/home/SectionHeader";
import { getAllProducts, getMultiOfferDeals } from "@/lib/catalog";
import { parseFilters, type RawParams } from "@/lib/searchParams";

export const metadata: Metadata = {
  title: "Winter deals",
  description: "The biggest winter fashion discounts right now, with prices compared across marketplaces.",
};

const DEAL_THRESHOLD = 55;

export default async function DealsPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const sp = await searchParams;
  const [all, compared] = await Promise.all([getAllProducts(), getMultiOfferDeals(3)]);
  const deals = all.filter((p) => p.discount >= DEAL_THRESHOLD);
  const { filters, sort } = parseFilters(sp);

  return (
    <>
      <PageHeader
        title="Winter deals"
        description={`Everything at ${DEAL_THRESHOLD}% off MRP or more, plus the products with the widest price gap between stores.`}
        crumbs={[{ label: "Home", href: "/" }, { label: "Deals" }]}
      />
      <div className="container py-8 md:py-10">
        {all.some((p) => p.isDemo) && <DemoNotice className="mb-8" />}

        <section aria-labelledby="compare-strip" className="mb-12">
          <SectionHeader id="compare-strip" title="Biggest price gaps today" description="Same product, different stores." />
          <ul className="space-y-4">
            {compared.map((p) => (
              <li key={p.id}>
                <BestDealCard product={p} wide />
              </li>
            ))}
          </ul>
        </section>

        <h2 className="mb-6 font-display text-2xl font-bold">All deals</h2>
        <Catalog
          key={JSON.stringify(sp)}
          products={deals}
          initialFilters={filters}
          initialSort={sp.sort ? sort : "discount_desc"}
        />
      </div>
    </>
  );
}
