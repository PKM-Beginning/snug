import { ProductGridSkeleton } from "@/components/catalog/Skeletons";

export default function Loading() {
  return (
    <div className="container py-10">
      <div className="mb-8 h-9 w-64 animate-pulse rounded-lg bg-ice-100" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
