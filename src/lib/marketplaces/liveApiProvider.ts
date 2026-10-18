import { api } from "@/lib/api/client";
import { toProduct, toProducts } from "@/lib/api/mappers";
import type { MarketplaceProvider, ProductQuery } from "./types";

/**
 * Serves products from the Snug FastAPI backend (NEXT_PUBLIC_USE_LIVE_API=true).
 * Pages that would otherwise be prebuilt call renderAtRequestTimeInLiveMode()
 * so the API is never contacted during `next build`.
 * Errors propagate as CatalogUnavailableError — there is deliberately NO
 * fallback to the mock catalogue, so demo data is never shown as live data.
 */
export const liveApiProvider: MarketplaceProvider = {
  name: "Snug API",
  isEnabled: () => true,
  async listProducts(query: ProductQuery = {}) {
    const items = await api.listAllProducts({
      category: query.category ? [query.category] : undefined,
      q: query.query,
    });
    const products = toProducts(items);
    return query.limit ? products.slice(0, query.limit) : products;
  },
  async getProduct(id: string) {
    const p = await api.getProduct(id);
    return p ? toProduct(p) : null;
  },
};
