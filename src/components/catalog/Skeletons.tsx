export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-navy-900/5 bg-white" aria-hidden>
      <div className="aspect-[4/5] animate-pulse bg-ice-100" />
      <div className="space-y-2.5 p-4">
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-ice-100" />
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-ice-100" />
        <div className="h-3 w-1/4 animate-pulse rounded bg-ice-100" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-ice-100" />
        <div className="h-8 w-full animate-pulse rounded-full bg-ice-100" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4" role="status" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
