import type { Product } from "@/lib/types";
import { cn } from "@/lib/format";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/catalog/EmptyState";

interface Props {
  products: Product[];
  columns?: 3 | 4 | 5;
  priorityCount?: number;
  emptyTitle?: string;
  emptyMessage?: string;
  /** Show only the first N items below the md breakpoint. */
  mobileLimit?: number;
}

const COLS = { 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-4 xl:grid-cols-5" };

export function ProductGrid({ products, columns = 5, priorityCount = 0, emptyTitle, emptyMessage, mobileLimit }: Props) {
  if (!products.length) {
    return <EmptyState title={emptyTitle ?? "No products here yet"} message={emptyMessage ?? "Check back soon for new winter deals."} />;
  }
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3", COLS[columns])}>
      {products.map((p, i) => (
        <li key={p.id} className={mobileLimit !== undefined && i >= mobileLimit ? "hidden md:block" : undefined}>
          <ProductCard product={p} index={i} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
