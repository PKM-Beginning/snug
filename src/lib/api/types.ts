/** Response shapes of the Snug FastAPI backend (backend/app/schemas.py). */

export type ApiAvailability = "in_stock" | "low_stock" | "out_of_stock";
export type ApiSort = "recommended" | "price_asc" | "discount_desc" | "newest";

export interface ApiMerchantRef {
  slug: string;
  name: string;
}

export interface ApiMerchant extends ApiMerchantRef {
  website_url: string;
  affiliate_network: string | null;
}

export interface ApiOffer {
  merchant: ApiMerchantRef;
  price: number;
  mrp: number | null;
  currency: string;
  availability: ApiAvailability;
  affiliate_url: string | null;
  last_checked_at: string;
  is_best: boolean;
  is_demo: boolean;
}

export interface ApiProduct {
  slug: string;
  title: string;
  description: string;
  brand: string;
  category: string;
  gender: string;
  image_url: string | null;
  winter_score: number;
  rating: number | null;
  review_count: number | null;
  rating_source: string | null;
  best_price: number | null;
  mrp: number | null;
  discount_percent: number;
  currency: string;
  offer_count: number;
  offers: ApiOffer[];
  is_demo: boolean;
  created_at: string;
}

export interface ApiProductDetail extends ApiProduct {
  images: { image_url: string; position: number }[];
}

export interface ApiPage<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface ApiCategory {
  slug: string;
  name: string;
  description: string;
  product_count: number;
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: { field: string; message: string }[] };
}

export interface ApiListParams {
  q?: string;
  category?: string[];
  gender?: string[];
  merchant?: string[];
  min_price?: number;
  max_price?: number;
  min_discount?: number;
  sort?: ApiSort;
  page?: number;
  page_size?: number;
}
