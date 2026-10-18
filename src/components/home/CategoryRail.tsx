import type { Category } from "@/lib/types";
import { CategoryCard } from "./CategoryCard";

/** Horizontal scroll-snap rail on mobile, 3/6-column grid on larger screens. */
export function CategoryRail({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  return (
    <ul className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-6">
      {categories.map((c) => (
        <li key={c.slug} className="w-[42%] shrink-0 snap-start sm:w-auto">
          <CategoryCard category={c} count={counts[c.slug] ?? 0} />
        </li>
      ))}
    </ul>
  );
}
