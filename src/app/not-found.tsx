import Link from "next/link";
import { Snowflake } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center py-24 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-ice-100 text-ice-500">
        <Snowflake className="h-8 w-8" aria-hidden />
      </span>
      <h1 className="mt-6 font-display text-3xl font-bold">This page went into hibernation</h1>
      <p className="mt-2 max-w-md text-navy-900/60">The product or page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-dark">
          Go home
        </Link>
        <Link href="/deals" className="btn-outline">
          See deals
        </Link>
      </div>
    </div>
  );
}
