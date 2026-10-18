import { Search } from "lucide-react";
import { cn } from "@/lib/format";

interface Props {
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
  id?: string;
}

/** Plain GET form → /products?q=… — works even before JS hydrates. */
export function SearchBar({ defaultValue, className, autoFocus, id = "site-search" }: Props) {
  return (
    <form action="/products" method="get" role="search" className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Search winter products
      </label>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-900/60" aria-hidden />
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder="Search jackets, hoodies, boots…"
        autoComplete="off"
        className="h-10 w-full rounded-full border border-navy-900/10 bg-ice-50 pl-10 pr-4 text-sm placeholder:text-navy-900/60 focus:border-ice-400 focus:bg-white focus:outline-none"
      />
    </form>
  );
}
