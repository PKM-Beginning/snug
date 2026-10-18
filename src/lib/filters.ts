import type { Gender, Merchant, Offer, Product, ProductFilters, SortOption } from "@/lib/types";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price_asc", label: "Lowest price" },
  { value: "discount_desc", label: "Highest discount" },
  { value: "rating_desc", label: "Highest rated" },
];

export const PRICE_OPTIONS = [
  { value: null, label: "Any price" },
  { value: 499, label: "Under ₹499" },
  { value: 999, label: "Under ₹999" },
  { value: 1499, label: "Under ₹1,499" },
  { value: 2499, label: "Under ₹2,499" },
] as const;

export const DISCOUNT_OPTIONS = [0, 30, 50, 60] as const;
export const RATING_OPTIONS = [0, 4, 4.3, 4.5] as const;
export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
  { value: "unisex", label: "Unisex" },
];
export const MERCHANT_OPTIONS: Merchant[] = ["Amazon", "Flipkart", "Myntra"];

export const EMPTY_FILTERS: ProductFilters = {
  query: "",
  categories: [],
  genders: [],
  maxPrice: null,
  minDiscount: 0,
  minRating: 0,
  merchants: [],
};

export function purchasableOffers(p: Product): Offer[] {
  return p.offers.filter((o) => o.availability !== "out_of_stock");
}

/** Lowest-priced purchasable offer; falls back to cheapest overall. */
export function bestOffer(p: Product): Offer {
  const pool = purchasableOffers(p).length ? purchasableOffers(p) : p.offers;
  return pool.reduce((min, o) => (o.price < min.price ? o : min));
}

export function recommendedScore(p: Product): number {
  return p.winterScore * 0.5 + (p.rating ?? 0) * 10 + p.discount * 0.3 + Math.log10((p.reviewCount ?? 0) + 1) * 2;
}

function matchesQuery(p: Product, query: string): boolean {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const haystack = `${p.name} ${p.brand} ${p.category} ${p.gender} ${p.description}`.toLowerCase();
  return terms.every((t) => haystack.includes(t.replace(/s$/, "")));
}

export function filterProducts(products: Product[], f: ProductFilters): Product[] {
  return products.filter((p) => {
    if (!matchesQuery(p, f.query)) return false;
    if (f.categories.length && !f.categories.includes(p.category)) return false;
    if (f.genders.length && !f.genders.includes(p.gender)) return false;
    if (f.maxPrice !== null && p.price >= f.maxPrice) return false;
    if (p.discount < f.minDiscount) return false;
    if (f.minRating > 0 && (p.rating === null || p.rating < f.minRating)) return false;
    if (f.merchants.length && !purchasableOffers(p).some((o) => f.merchants.includes(o.merchant))) return false;
    return true;
  });
}

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const copy = [...products];
  switch (sort) {
    case "price_asc":
      return copy.sort((a, b) => a.price - b.price);
    case "discount_desc":
      return copy.sort((a, b) => b.discount - a.discount);
    case "rating_desc":
      return copy.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    default:
      return copy.sort((a, b) => recommendedScore(b) - recommendedScore(a));
  }
}

export function countActiveFilters(f: ProductFilters, lockedCategory: boolean): number {
  return (
    (lockedCategory ? 0 : f.categories.length) +
    f.genders.length +
    f.merchants.length +
    (f.maxPrice !== null ? 1 : 0) +
    (f.minDiscount > 0 ? 1 : 0) +
    (f.minRating > 0 ? 1 : 0)
  );
}
