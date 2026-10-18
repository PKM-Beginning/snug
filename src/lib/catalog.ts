/**
 * Data-access layer. Every page reads products through these functions,
 * so swapping the mock provider for real affiliate providers is a change
 * here and in `marketplaces/` only.
 */
import { mockProvider } from "@/lib/marketplaces/mockProvider";
import { liveApiProvider } from "@/lib/marketplaces/liveApiProvider";
import { USE_LIVE_API } from "@/lib/config";
import type { MarketplaceProvider } from "@/lib/marketplaces/types";
import type { CategorySlug, Product } from "@/lib/types";
import type { Category } from "@/lib/types";
import { recommendedScore } from "@/lib/filters";
import { categories } from "@/lib/data/categories";
import { categoryImage, productImage } from "@/lib/assets";

// NEXT_PUBLIC_USE_LIVE_API=true -> FastAPI backend; otherwise the in-repo mock catalogue.
// The two are never mixed, so demo data is never presented as live data.
const providers: MarketplaceProvider[] = [USE_LIVE_API ? liveApiProvider : mockProvider];

async function all(): Promise<Product[]> {
  const enabled = providers.filter((p) => p.isEnabled());
  const lists = await Promise.all(enabled.map((p) => p.listProducts()));
  // TODO(real integrations): merge offers for the same item across providers
  // (match on GTIN/EAN or a curated mapping) instead of concatenating.
  return lists.flat().map(withPhoto);
}

/** Prefer a real product photo from public/images/products/ over the placeholder. */
function withPhoto(p: Product): Product {
  return { ...p, image: productImage(p.id, p.image) };
}

/** Categories with their own card image (public/images/categories/), never a product photo. */
export async function getCategories(): Promise<Category[]> {
  return categories.map((c) => ({ ...c, image: categoryImage(c.slug, c.image) }));
}

export async function getAllProducts(): Promise<Product[]> {
  return all();
}

export async function getProductById(id: string): Promise<Product | null> {
  for (const p of providers) {
    if (!p.isEnabled()) continue;
    const hit = await p.getProduct(id);
    if (hit) return withPhoto(hit);
  }
  return null;
}

export async function getProductsByCategory(category: CategorySlug): Promise<Product[]> {
  return (await all()).filter((p) => p.category === category);
}

export async function getTrendingProducts(limit = 8): Promise<Product[]> {
  return (await all()).sort((a, b) => recommendedScore(b) - recommendedScore(a)).slice(0, limit);
}

export async function getProductsUnder(maxPrice: number, limit = 8): Promise<Product[]> {
  return (await all())
    .filter((p) => p.price < maxPrice)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, limit);
}

/** Products with 3+ purchasable offers, ordered by the biggest spread between stores. */
export async function getMultiOfferDeals(limit = 3): Promise<Product[]> {
  return (await all())
    .filter((p) => p.offers.filter((o) => o.availability !== "out_of_stock").length >= 3)
    .sort((a, b) => spread(b) - spread(a))
    .slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const pool = (await all()).filter((p) => p.id !== product.id);
  const same = pool.filter((p) => p.category === product.category);
  const rest = pool.filter((p) => p.category !== product.category && p.gender === product.gender);
  return [...same, ...rest].slice(0, limit);
}

function spread(p: Product): number {
  const prices = p.offers.map((o) => o.price);
  return Math.max(...prices) - Math.min(...prices);
}
