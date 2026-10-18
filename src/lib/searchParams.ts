import type { CategorySlug, Gender, Merchant, ProductFilters, SortOption } from "@/lib/types";
import { EMPTY_FILTERS, MERCHANT_OPTIONS, SORT_OPTIONS } from "@/lib/filters";
import { categories } from "@/lib/data/categories";

export type RawParams = Record<string, string | string[] | undefined>;

const GENDERS: Gender[] = ["men", "women", "kids", "unisex"];
const CATS = categories.map((c) => c.slug);

function list(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return (Array.isArray(v) ? v : v.split(",")).map((s) => s.trim()).filter(Boolean);
}

function num(v: string | string[] | undefined): number | null {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** URL → filters. Unknown values are dropped, so bad links can't break the page. */
export function parseFilters(params: RawParams): { filters: ProductFilters; sort: SortOption } {
  const q = params.q;
  const sortRaw = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  return {
    filters: {
      ...EMPTY_FILTERS,
      query: (Array.isArray(q) ? q[0] : q)?.slice(0, 80) ?? "",
      categories: list(params.category).filter((c): c is CategorySlug => CATS.includes(c as CategorySlug)),
      genders: list(params.gender).filter((g): g is Gender => GENDERS.includes(g as Gender)),
      merchants: list(params.store)
        .map((m) => MERCHANT_OPTIONS.find((o) => o.toLowerCase() === m.toLowerCase()))
        .filter((m): m is Merchant => Boolean(m)),
      maxPrice: num(params.maxPrice),
      minDiscount: num(params.minDiscount) ?? 0,
      minRating: num(params.minRating) ?? 0,
    },
    sort: SORT_OPTIONS.some((s) => s.value === sortRaw) ? (sortRaw as SortOption) : "recommended",
  };
}

/** Filters → query string (omits defaults). */
export function serializeFilters(f: ProductFilters, sort: SortOption, omitCategory = false): string {
  const p = new URLSearchParams();
  if (f.query) p.set("q", f.query);
  if (!omitCategory && f.categories.length) p.set("category", f.categories.join(","));
  if (f.genders.length) p.set("gender", f.genders.join(","));
  if (f.merchants.length) p.set("store", f.merchants.map((m) => m.toLowerCase()).join(","));
  if (f.maxPrice) p.set("maxPrice", String(f.maxPrice));
  if (f.minDiscount) p.set("minDiscount", String(f.minDiscount));
  if (f.minRating) p.set("minRating", String(f.minRating));
  if (sort !== "recommended") p.set("sort", sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}
