/**
 * Feature flags and server-side configuration.
 *
 * NEXT_PUBLIC_USE_LIVE_API is inlined at build time: changing it requires a
 * rebuild (or a dev-server restart).
 */
export const USE_LIVE_API = process.env.NEXT_PUBLIC_USE_LIVE_API === "true";

/**
 * Call at the top of a page that would otherwise be statically prebuilt.
 * In live mode it defers rendering to request time (so `next build` never
 * needs the backend); in mock mode it does nothing and the page stays static.
 */
export async function renderAtRequestTimeInLiveMode(): Promise<void> {
  if (!USE_LIVE_API) return;
  const { connection } = await import("next/server");
  await connection();
}

/** Server-only: where the FastAPI backend lives. Never exposed to the browser. */
export const API_BASE_URL = (process.env.API_BASE_URL ?? "http://localhost:8000").replace(/\/+$/, "");

/**
 * Seconds Next.js may cache API responses. Default 0 = no caching, so an API
 * outage shows an error instead of indefinitely stale prices (Next keeps
 * serving cached data when revalidation fails). Prefer caching at the
 * backend/CDN, which honours each merchant's offer_cache_ttl_seconds.
 */
export const API_REVALIDATE_SECONDS = Math.max(0, Number(process.env.API_REVALIDATE_SECONDS ?? 0) || 0);

/** Hosts allowed for remote product images (must match next.config.ts). */
export const IMAGE_REMOTE_HOSTS = (process.env.IMAGE_REMOTE_HOSTS ?? "")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);
