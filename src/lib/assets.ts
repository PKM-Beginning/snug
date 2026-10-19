/**
 * Image asset resolution (server-side only — uses the filesystem).
 *
 * Each asset type has its own folder so photos are never shared between the
 * hero, category cards, product cards and banners:
 *
 *   public/images/hero/snug-hero.(webp|jpg|png|avif)
 *   public/images/categories/<category-slug>.(…)
 *   public/images/products/<product-id>.(…)
 *   public/images/banners/<banner-name>.(…)
 *
 * When a photo is missing, the existing SVG placeholder is used instead.
 * Run `npm run images:check` to list which photos are still missing.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

const EXTENSIONS = [".webp", ".jpg", ".jpeg", ".png", ".avif"];
const PUBLIC_DIR = join(process.cwd(), "public");
const cache = new Map<string, string | null>();
// In dev, re-check every request so newly added photos appear without a restart.
const useCache = process.env.NODE_ENV === "production";

function findPhoto(basePath: string): string | null {
  if (useCache && cache.has(basePath)) return cache.get(basePath)!;
  const hit = EXTENSIONS.map((ext) => basePath + ext).find((p) => existsSync(join(PUBLIC_DIR, p))) ?? null;
  if (useCache) cache.set(basePath, hit);
  return hit;
}

export const BANNERS = {
  under999: "winter-under-999",
  wardrobe: "build-your-wardrobe",
} as const;

export function heroPhoto(): string | undefined {
  return findPhoto("/images/hero/Alpine Sunrise with Cozy Travellers") ?? undefined;
}

export function categoryImage(slug: string, fallback: string): string {
  return findPhoto(`/images/categories/${slug}`) ?? fallback;
}

export function productImage(id: string, fallback: string): string {
  return findPhoto(`/images/products/${id}`) ?? fallback;
}

export function bannerPhoto(name: string): string | undefined {
  return findPhoto(`/images/banners/${name}`) ?? undefined;
}

/** True for the generated SVG illustrations (rendered contained, not cropped). */
export function isPlaceholder(src: string): boolean {
  return src.endsWith(".svg");
}
