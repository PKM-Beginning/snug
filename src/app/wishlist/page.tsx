import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { WishlistView } from "@/components/product/WishlistView";
import { getAllProducts } from "@/lib/catalog";
import { renderAtRequestTimeInLiveMode } from "@/lib/config";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default async function WishlistPage() {
  await renderAtRequestTimeInLiveMode();
  const products = await getAllProducts();
  return (
    <>
      <PageHeader
        title="Your wishlist"
        description="Saved on this device only. Accounts are coming soon."
        crumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
      />
      <div className="container py-8 md:py-10">
        <WishlistView products={products} />
      </div>
    </>
  );
}
