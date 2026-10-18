export type Merchant = "Amazon" | "Flipkart" | "Myntra";

export type Gender = "men" | "women" | "kids" | "unisex";

export type CategorySlug =
  | "jackets"
  | "hoodies"
  | "sweaters"
  | "sweatshirts"
  | "accessories"
  | "footwear";

export type Availability = "in_stock" | "low_stock" | "out_of_stock";

export interface Offer {
  merchant: Merchant;
  price: number;
  /** Affiliate link supplied by the marketplace program. "#" = placeholder. */
  affiliateUrl: string;
  availability: Availability;
  /** ISO timestamp of when this offer was last refreshed from its source. */
  lastUpdated: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: CategorySlug;
  gender: Gender;
  image: string;
  /** null when no rating data is available (e.g. live data without a reliable source). */
  rating: number | null;
  reviewCount: number | null;
  mrp: number;
  /** Lowest available offer price (derived). */
  price: number;
  /** Percentage off MRP at `price` (derived). */
  discount: number;
  /** 0–100 editorial warmth/season-fit score used for "Recommended" sort. */
  winterScore: number;
  description: string;
  highlights: string[];
  offers: Offer[];
  /** True while the catalogue is mock data. Real feed items set this to false. */
  isDemo: boolean;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  image: string;
  tint: string;
}

export type SortOption = "recommended" | "price_asc" | "discount_desc" | "rating_desc";

export interface ProductFilters {
  query: string;
  categories: CategorySlug[];
  genders: Gender[];
  maxPrice: number | null;
  minDiscount: number;
  minRating: number;
  merchants: Merchant[];
}
