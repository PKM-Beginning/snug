import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Catalog } from "@/components/catalog/Catalog";
import { DemoNotice } from "@/components/product/DemoBadge";
import { categories } from "@/lib/data/categories";
import { getProductsByCategory } from "@/lib/catalog";
import { renderAtRequestTimeInLiveMode } from "@/lib/config";
import { parseFilters, type RawParams } from "@/lib/searchParams";

// Only pre-built paths exist, so unknown URLs get a real HTTP 404 (not a streamed 200).
export const dynamicParams = false;

type Params = Promise<{ category: string }>;

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category } = await params;
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return { title: "Category not found" };
  return { title: `${cat.name} deals`, description: `${cat.description} Compare prices across marketplaces on Snug.` };
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: Promise<RawParams> }) {
  await renderAtRequestTimeInLiveMode();
  const [{ category }, sp] = await Promise.all([params, searchParams]);
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  const products = await getProductsByCategory(cat.slug);
  const { filters, sort } = parseFilters(sp);

  return (
    <>
      <PageHeader
        title={cat.name}
        description={cat.description}
        crumbs={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: cat.name }]}
      />
      <div className="container py-8 md:py-10">
        {products.some((p) => p.isDemo) && <DemoNotice className="mb-6" />}
        <Catalog
          key={JSON.stringify(sp)}
          products={products}
          initialFilters={{ ...filters, categories: [cat.slug] }}
          initialSort={sort}
          lockedCategory
        />
      </div>
    </>
  );
}
