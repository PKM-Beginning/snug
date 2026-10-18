import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Catalog } from "@/components/catalog/Catalog";
import { DemoNotice } from "@/components/product/DemoBadge";
import { getAllProducts } from "@/lib/catalog";
import { parseFilters, type RawParams } from "@/lib/searchParams";

export const metadata: Metadata = {
  title: "All winter products",
  description: "Search, filter and compare winter jackets, hoodies, sweaters, accessories and footwear across marketplaces.",
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const params = await searchParams;
  const { filters, sort } = parseFilters(params);
  const products = await getAllProducts();

  const title = filters.query ? `Results for “${filters.query}”` : "All winter products";

  return (
    <>
      <PageHeader
        title={title}
        description="Compare prices across stores, then buy directly from the marketplace."
        crumbs={[{ label: "Home", href: "/" }, { label: "Products" }]}
      />
      <div className="container py-8 md:py-10">
        {products.some((p) => p.isDemo) && <DemoNotice className="mb-6" />}
        {/* key resets client state when the URL changes via navbar links */}
        <Catalog key={JSON.stringify(params)} products={products} initialFilters={filters} initialSort={sort} />
      </div>
    </>
  );
}
