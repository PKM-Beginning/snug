import type { CategorySlug, Merchant, Product } from "@/lib/types";

/**
 * Contract every marketplace integration implements.
 *
 * A future AmazonProvider / FlipkartProvider / MyntraProvider would wrap that
 * marketplace's *official* affiliate API or product feed (never scraping),
 * normalise results into `Product`/`Offer`, and attach the affiliate URL
 * issued by the program. `catalog.ts` merges offers across providers.
 */
export interface ProductQuery {
  category?: CategorySlug;
  query?: string;
  limit?: number;
}

export interface MarketplaceProvider {
  /** Display name. "Mock" for the demo provider. */
  readonly name: Merchant | "Mock" | "Snug API";
  /** True only when credentials/approval for the affiliate program exist. */
  isEnabled(): boolean;
  listProducts(query?: ProductQuery): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
}
