/** Converts backend responses into the frontend's existing Product shape. */
import type { Availability, CategorySlug, Gender, Merchant, Offer, Product } from "@/lib/types";
import { IMAGE_REMOTE_HOSTS } from "@/lib/config";
import type { ApiOffer, ApiProduct, ApiProductDetail } from "./types";

const MERCHANTS: Record<string, Merchant> = { amazon: "Amazon", flipkart: "Flipkart", myntra: "Myntra" };
const CATEGORIES: CategorySlug[] = ["jackets", "hoodies", "sweaters", "sweatshirts", "accessories", "footwear"];
const GENDERS: Gender[] = ["men", "women", "kids", "unisex"];
const AVAILABILITY: Availability[] = ["in_stock", "low_stock", "out_of_stock"];

/** Only https links are ever rendered as outbound links; anything else becomes a demo button. */
export function safeAffiliateUrl(url: string | null): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    return u.protocol === "https:" && !u.username && !u.password ? u.toString() : "";
  } catch {
    return "";
  }
}

/** Relative /images/ paths, or https images on hosts configured in IMAGE_REMOTE_HOSTS. */
function safeImage(url: string | null, category: CategorySlug): string {
  const fallback = `/images/placeholders/${category}-ice.svg`;
  if (!url) return fallback;
  if (url.startsWith("/images/") && !url.includes("..")) return url;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (u.protocol === "https:" && IMAGE_REMOTE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return u.toString();
  } catch {
    /* fall through */
  }
  return fallback;
}

function toOffer(o: ApiOffer): Offer | null {
  const merchant = MERCHANTS[o.merchant.slug];
  if (!merchant) return null; // merchant not yet supported by the UI
  return {
    merchant,
    price: o.price,
    affiliateUrl: safeAffiliateUrl(o.affiliate_url),
    availability: AVAILABILITY.includes(o.availability) ? o.availability : "out_of_stock",
    lastUpdated: o.last_checked_at,
  };
}

export function toProduct(p: ApiProduct | ApiProductDetail): Product | null {
  const category = CATEGORIES.find((c) => c === p.category);
  const gender = GENDERS.find((g) => g === p.gender);
  const offers = p.offers.map(toOffer).filter((o): o is Offer => o !== null);
  if (!category || !gender || !offers.length) return null;

  const purchasable = offers.filter((o) => o.availability !== "out_of_stock");
  const price = p.best_price ?? Math.min(...(purchasable.length ? purchasable : offers).map((o) => o.price));

  return {
    id: p.slug,
    name: p.title,
    brand: p.brand,
    category,
    gender,
    image: safeImage(p.image_url, category),
    rating: p.rating,
    reviewCount: p.review_count,
    mrp: p.mrp ?? price,
    price,
    discount: p.discount_percent,
    winterScore: p.winter_score,
    description: p.description,
    highlights: [],
    offers,
    isDemo: p.is_demo,
  };
}

export function toProducts(items: ApiProduct[]): Product[] {
  return items.map(toProduct).filter((p): p is Product => p !== null);
}
