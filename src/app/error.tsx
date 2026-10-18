"use client";

import Link from "next/link";
import { CloudOff, RotateCw } from "lucide-react";

const LIVE = process.env.NEXT_PUBLIC_USE_LIVE_API === "true";

/**
 * Shown when a page fails to load — in live mode, typically because the
 * Snug catalogue API is unreachable. It never falls back to demo data.
 */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container flex flex-col items-center py-24 text-center" role="alert">
      <span className="glass grid h-16 w-16 place-items-center rounded-full text-ice-500">
        <CloudOff className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-6 font-display text-3xl font-bold">
        {LIVE ? "Live prices are unavailable right now" : "Something went wrong"}
      </h1>
      <p className="mt-2 max-w-md text-navy-900/65">
        {LIVE
          ? "Snug couldn't reach its catalogue service, so we're not showing any prices rather than showing out-of-date ones. Please try again in a moment."
          : "This page couldn't be loaded. Please try again."}
      </p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          <RotateCw className="h-4 w-4" aria-hidden />
          Try again
        </button>
        <Link href="/" className="btn-outline">
          Go home
        </Link>
      </div>
    </div>
  );
}
