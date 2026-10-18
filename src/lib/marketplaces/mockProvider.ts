import { mockProducts } from "@/lib/data/products";
import type { MarketplaceProvider, ProductQuery } from "./types";

/** Serves the in-repo demo catalogue. Replace with real providers later. */
export const mockProvider: MarketplaceProvider = {
  name: "Mock",
  isEnabled: () => true,
  async listProducts(query: ProductQuery = {}) {
    let items = mockProducts;
    if (query.category) items = items.filter((p) => p.category === query.category);
    if (query.limit) items = items.slice(0, query.limit);
    return items;
  },
  async getProduct(id: string) {
    return mockProducts.find((p) => p.id === id) ?? null;
  },
};
