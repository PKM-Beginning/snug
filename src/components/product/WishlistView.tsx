"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { useWishlist } from "@/context/WishlistContext";
import { ProductGrid } from "./ProductGrid";
import { EmptyState } from "@/components/catalog/EmptyState";
import { ProductGridSkeleton } from "@/components/catalog/Skeletons";

export function WishlistView({ products }: { products: Product[] }) {
  const { ids, ready } = useWishlist();
  if (!ready) return <ProductGridSkeleton count={4} />;

  const saved = products.filter((p) => ids.includes(p.id));
  if (!saved.length) {
    return (
      <EmptyState
        title="Nothing saved yet"
        message="Tap the heart on any product to keep it here for later."
        action={
          <Link href="/deals" className="btn-primary">
            Browse winter deals
          </Link>
        }
      />
    );
  }
  return <ProductGrid products={saved} />;
}
