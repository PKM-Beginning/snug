"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface WishlistValue {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  ready: boolean;
}

const WishlistContext = createContext<WishlistValue | null>(null);
const KEY = "snug:wishlist";
/** Pre-rename key; read once so existing wishlists carry over. */
const LEGACY_KEY = "frostfind:wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
      localStorage.removeItem(LEGACY_KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {
      /* storage unavailable — wishlist stays in memory */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [ids, ready]);

  const toggle = useCallback((id: string) => {
    setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }, []);

  const value = useMemo(() => ({ ids, has: (id: string) => ids.includes(id), toggle, ready }), [ids, toggle, ready]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
