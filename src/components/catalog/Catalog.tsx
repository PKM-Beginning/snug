"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Product, ProductFilters, SortOption } from "@/lib/types";
import { EMPTY_FILTERS, SORT_OPTIONS, countActiveFilters, filterProducts, sortProducts } from "@/lib/filters";
import { serializeFilters } from "@/lib/searchParams";
import { cn } from "@/lib/format";
import { FilterPanel } from "./FilterPanel";
import { EmptyState } from "./EmptyState";
import { ProductGrid } from "@/components/product/ProductGrid";

interface Props {
  products: Product[];
  initialFilters: ProductFilters;
  initialSort?: SortOption;
  /** On category pages the category is fixed by the route. */
  lockedCategory?: boolean;
}

export function Catalog({ products, initialFilters, initialSort = "recommended", lockedCategory = false }: Props) {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const deferredQuery = useDeferredValue(filters.query);

  const results = useMemo(
    () => sortProducts(filterProducts(products, { ...filters, query: deferredQuery }), sort),
    [products, filters, deferredQuery, sort]
  );
  const activeCount = countActiveFilters(filters, lockedCategory);

  // Keep the URL shareable without triggering a navigation.
  useEffect(() => {
    const qs = serializeFilters(filters, sort, lockedCategory);
    window.history.replaceState(null, "", `${window.location.pathname}${qs}`);
  }, [filters, sort, lockedCategory]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const reset = () =>
    setFilters({ ...EMPTY_FILTERS, categories: lockedCategory ? initialFilters.categories : [], query: filters.query });

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Filters</h2>
            {activeCount > 0 && (
              <button type="button" onClick={reset} className="text-xs font-semibold text-ice-500 hover:underline">
                Clear all ({activeCount})
              </button>
            )}
          </div>
          <FilterPanel filters={filters} onChange={setFilters} hideCategory={lockedCategory} idPrefix="d" />
        </div>
      </aside>

      <div className="min-w-0">
        {/* Toolbar */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <label htmlFor="catalog-search" className="sr-only">
              Search within results
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-900/60" aria-hidden />
            <input
              id="catalog-search"
              type="search"
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              placeholder="Search by name, brand or type"
              className="h-11 w-full rounded-full border border-navy-900/10 bg-white pl-10 pr-4 text-sm focus:border-ice-400 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="btn-outline h-11 flex-1 py-0 lg:hidden"
              aria-haspopup="dialog"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              Filters{activeCount > 0 && ` (${activeCount})`}
            </button>
            <label htmlFor="sort" className="sr-only">
              Sort by
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="h-11 flex-1 cursor-pointer rounded-full border border-navy-900/10 bg-white px-4 text-sm font-medium focus:border-ice-400 focus:outline-none sm:flex-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  Sort: {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mb-4 text-sm text-navy-900/60" aria-live="polite">
          {results.length} {results.length === 1 ? "product" : "products"}
          {deferredQuery && (
            <>
              {" "}for <span className="font-semibold text-navy-900">“{deferredQuery}”</span>
            </>
          )}
        </p>

        {results.length ? (
          <ProductGrid products={results} columns={3} priorityCount={3} />
        ) : (
          <EmptyState
            title="No matches"
            message="Try a different search term or loosen a filter or two."
            action={
              <button type="button" className="btn-dark" onClick={() => setFilters({ ...EMPTY_FILTERS, categories: lockedCategory ? initialFilters.categories : [] })}>
                Reset search & filters
              </button>
            }
          />
        )}
      </div>

      {/* Mobile filter drawer */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", drawerOpen ? "visible" : "invisible")} aria-hidden={!drawerOpen}>
        <div
          className={cn("absolute inset-0 bg-navy-950/40 transition-opacity", drawerOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setDrawerOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          className={cn(
            "absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl bg-white transition-transform duration-200",
            drawerOpen ? "translate-y-0" : "translate-y-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-navy-900/5 px-5 py-4">
            <h2 className="font-semibold">Filters</h2>
            <button type="button" onClick={() => setDrawerOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-ice-50" aria-label="Close filters">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {drawerOpen && <FilterPanel filters={filters} onChange={setFilters} hideCategory={lockedCategory} idPrefix="m" />}
          </div>
          <div className="flex gap-3 border-t border-navy-900/5 p-4">
            <button type="button" onClick={reset} className="btn-outline flex-1">
              Clear
            </button>
            <button type="button" onClick={() => setDrawerOpen(false)} className="btn-dark flex-[2]">
              Show {results.length} results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
