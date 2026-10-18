"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, User, X } from "lucide-react";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/format";
import { IS_PREVIEW } from "@/lib/site";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products?gender=men", label: "Men" },
  { href: "/products?gender=women", label: "Women" },
  { href: "/products?gender=kids", label: "Kids" },
  { href: "/category/accessories", label: "Accessories" },
  { href: "/category/footwear", label: "Footwear" },
  { href: "/deals", label: "Deals", accent: true },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { ids, ready } = useWishlist();

  // Close overlays on navigation
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const isActive = (href: string) => {
    const path = href.split("?")[0];
    if (href.includes("?")) return false; // gender links share /products
    return path === "/" ? pathname === "/" : pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 pt-3">
      <div className="container">
      <div className="glass rounded-2xl bg-white/80">
      <div className="flex h-14 items-center gap-3 px-3 sm:px-4 lg:h-16 lg:px-5">
        <button
          type="button"
          className="-ml-2 grid h-10 w-10 place-items-center rounded-full hover:bg-ice-50 lg:hidden"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <Logo />

        <nav aria-label="Main" className="ml-4 hidden lg:block xl:ml-8">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                    isActive(l.href) ? "bg-ice-100 text-ice-500" : "text-navy-900/75 hover:text-navy-900",
                    l.accent && "text-ember-600 hover:text-ember-700"
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <SearchBar className="mr-2 hidden w-60 xl:block 2xl:w-72" id="desktop-search" />
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-ice-50 xl:hidden"
            aria-label={searchOpen ? "Close search" : "Open search"}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
          <Link
            href="/wishlist"
            className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-ice-50"
            aria-label={`Wishlist${ready && ids.length ? `, ${ids.length} items` : ""}`}
          >
            <Heart className="h-5 w-5" />
            {ready && ids.length > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-ember-500 px-1 text-[10px] font-bold text-white">
                {ids.length}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="hidden h-10 w-10 place-items-center rounded-full hover:bg-ice-50 sm:grid"
            aria-label="Account (coming soon)"
            title="Accounts are coming soon"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-navy-900/5 px-3 py-3 xl:hidden">
          <SearchBar autoFocus id="mobile-search" />
        </div>
      )}
      </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn("fixed inset-0 z-50 lg:hidden", menuOpen ? "visible" : "invisible")}
        aria-hidden={!menuOpen}
      >
        <div
          className={cn("absolute inset-0 bg-navy-950/40 transition-opacity", menuOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setMenuOpen(false)}
        />
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={cn(
            "absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-white shadow-lift transition-transform duration-200",
            menuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-navy-900/5 px-4">
            <Logo />
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-ice-50"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? 0 : -1}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4">
            <SearchBar id="drawer-search" />
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-2">
            <ul>
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    tabIndex={menuOpen ? 0 : -1}
                    className={cn(
                      "flex items-center rounded-xl px-3 py-3 text-base font-medium hover:bg-ice-50",
                      l.accent ? "text-ember-600" : "text-navy-900"
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="border-t border-navy-900/5 p-4 text-xs text-navy-900/60">
            {IS_PREVIEW
              ? "Preview: all products, prices and ratings are demo data. Buying isn't possible yet."
              : "Snug links to partner marketplaces. We may earn a commission."}
          </p>
        </div>
      </div>
    </header>
  );
}
