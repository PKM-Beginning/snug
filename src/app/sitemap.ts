import type { MetadataRoute } from "next";
import { categories } from "@/lib/data/categories";
import { getAllProducts } from "@/lib/catalog";
import { USE_LIVE_API } from "@/lib/config";
import { SITE_URL } from "@/lib/site";

const INFO = ["about", "how-it-works", "affiliate-disclosure", "privacy", "terms", "contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => `${SITE_URL}${path}`;
  const pages = ["/", "/products", "/deals", ...categories.map((c) => `/category/${c.slug}`), ...INFO.map((s) => `/info/${s}`)];
  // In live mode, product URLs come from the API at request time, so they are
  // not listed here (the sitemap is generated at build time).
  const products = USE_LIVE_API ? [] : (await getAllProducts()).map((p) => `/products/${p.id}`);
  return [...pages, ...products].map((p) => ({ url: url(p) }));
}
