/**
 * Site-wide settings that are safe to use in any component.
 */

/**
 * The site is a PREVIEW whenever it runs on the built-in mock catalogue.
 * In preview, every product/price/discount/rating is demonstration data,
 * no affiliate relationship exists, and Buy buttons are disabled.
 */
export const IS_PREVIEW = process.env.NEXT_PUBLIC_USE_LIVE_API !== "true";

/** Canonical site URL for metadata. On Vercel, falls back to the production domain. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

/**
 * Search-engine indexing is OFF unless ALLOW_INDEXING=true, so demo prices
 * aren't indexed as real deals while the site is a preview.
 */
export const ALLOW_INDEXING = process.env.ALLOW_INDEXING === "true";

export const PREVIEW_MESSAGE =
  "Snug is a preview, not a working shopping service. All products, prices, discounts and ratings are demonstration data.";
