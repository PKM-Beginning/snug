import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/types";
import { ProductImage } from "@/components/product/ProductImage";

export function CategoryCard({ category, count }: { category: Category; count: number }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className={`group flex h-full flex-col items-center rounded-2xl border border-navy-900/[0.06] bg-gradient-to-b ${category.tint} px-3 pb-4 pt-3 text-center shadow-card transition-shadow hover:shadow-lift`}
    >
      <div className="relative aspect-square w-full max-w-[150px] overflow-hidden rounded-xl">
        <ProductImage src={category.image} alt="" sizes="150px" className="transition-transform duration-300 group-hover:scale-105" />
      </div>
      <h3 className="mt-2 text-sm font-semibold leading-tight">{category.shortName}</h3>
      <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-navy-900/65 group-hover:text-ice-500">
        Explore · {count}
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </p>
    </Link>
  );
}
