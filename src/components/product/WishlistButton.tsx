"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/format";

export function WishlistButton({ id, name, className }: { id: string; name: string; className?: string }) {
  const { has, toggle } = useWishlist();
  const saved = has(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white",
        className
      )}
    >
      <Heart className={cn("h-4 w-4", saved ? "fill-ember-500 text-ember-500" : "text-navy-900/70")} />
    </button>
  );
}
