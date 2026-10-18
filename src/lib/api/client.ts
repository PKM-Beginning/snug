/**
 * Typed client for the Snug FastAPI backend. Server-side only: it is called
 * from Server Components / the catalogue layer, so the API URL and any future
 * credentials never reach the browser.
 */
import { API_BASE_URL, API_REVALIDATE_SECONDS } from "@/lib/config";
import type {
  ApiCategory,
  ApiErrorBody,
  ApiListParams,
  ApiMerchant,
  ApiPage,
  ApiProduct,
  ApiProductDetail,
} from "./types";

const TIMEOUT_MS = 8000;
export const MAX_PAGE_SIZE = 60;

/** The backend answered with a structured error (4xx). */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: { field: string; message: string }[]
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** The backend could not be reached, timed out, or failed (5xx). */
export class CatalogUnavailableError extends Error {
  constructor(message = "The Snug catalogue service is unavailable.") {
    super(message);
    this.name = "CatalogUnavailableError";
  }
}

function toQuery(params: ApiListParams = {}): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length) qs.set(key, value.join(","));
    } else {
      qs.set(key, String(value));
    }
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

async function apiGet<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      ...(API_REVALIDATE_SECONDS > 0 ? { next: { revalidate: API_REVALIDATE_SECONDS } } : { cache: "no-store" as const }),
    });
  } catch {
    throw new CatalogUnavailableError();
  }

  if (res.status >= 500) throw new CatalogUnavailableError();
  if (!res.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      /* non-JSON error */
    }
    throw new ApiError(res.status, body?.error.code ?? "http_error", body?.error.message ?? res.statusText, body?.error.details);
  }
  return (await res.json()) as T;
}

export const api = {
  listProducts: (params?: ApiListParams) => apiGet<ApiPage<ApiProduct>>(`/api/products${toQuery(params)}`),

  search: (q: string, params?: Omit<ApiListParams, "q">) => apiGet<ApiPage<ApiProduct>>(`/api/search${toQuery({ ...params, q })}`),

  deals: (params?: ApiListParams & { type?: "discount" | "price_gap" }) =>
    apiGet<ApiPage<ApiProduct>>(`/api/deals${toQuery(params as ApiListParams)}`),

  /** Resolves to null for unknown products (404). */
  async getProduct(slug: string): Promise<ApiProductDetail | null> {
    try {
      return await apiGet<ApiProductDetail>(`/api/products/${encodeURIComponent(slug)}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },

  categories: () => apiGet<ApiCategory[]>("/api/categories"),

  merchants: () => apiGet<ApiMerchant[]>("/api/merchants"),

  /** Follows pagination to return every product matching the params. */
  async listAllProducts(params: Omit<ApiListParams, "page" | "page_size"> = {}): Promise<ApiProduct[]> {
    const first = await api.listProducts({ ...params, page: 1, page_size: MAX_PAGE_SIZE });
    const rest = await Promise.all(
      Array.from({ length: Math.max(0, first.total_pages - 1) }, (_, i) =>
        api.listProducts({ ...params, page: i + 2, page_size: MAX_PAGE_SIZE })
      )
    );
    return [first, ...rest].flatMap((p) => p.items);
  },
};
