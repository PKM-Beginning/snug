import Link from "next/link";
import { Snowflake } from "lucide-react";

export function Logo({ showTagline = false }: { showTagline?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="Snug home">
      {/* Icy gradient tile with a soft top highlight */}
      <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-[#8FD3FF] via-[#3F86E8] to-[#6A5BEF] text-white shadow-[0_4px_14px_-4px_rgba(63,134,232,0.6)] ring-1 ring-white/60">
        <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/45 to-transparent" aria-hidden />
        <Snowflake className="relative h-5 w-5 drop-shadow-[0_1px_1px_rgba(11,27,63,0.25)]" strokeWidth={2.25} aria-hidden />
      </span>
      <span className="leading-none">
        
        <span className="inline-block bg-gradient-to-r from-navy-900 via-navy-700 to-ice-500 bg-clip-text font-display text-[22px] font-bold leading-[1.3] tracking-tight text-transparent pb-1">
          Snug
        </span>

        {showTagline && <span className="mt-1 block text-[11px] font-medium text-navy-900/65">Stay Warm. Spend Less.</span>}
      </span>
    </Link>
  );
}
