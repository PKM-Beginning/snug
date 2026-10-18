import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { PromoBar } from "@/components/layout/PromoBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WishlistProvider } from "@/context/WishlistContext";
import { WinterBackdrop } from "@/components/layout/WinterBackdrop";
import { ALLOW_INDEXING, IS_PREVIEW, SITE_URL } from "@/lib/site";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["600", "700"] });

const DESCRIPTION = IS_PREVIEW
  ? "Preview of Snug, a winter-fashion price comparison site. Browse jackets, hoodies, sweaters and essentials — all products and prices shown are demonstration data."
  : "Discover and compare winter jackets, hoodies, sweaters and essentials across marketplaces, then buy directly from the store.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Snug — Stay Warm. Spend Less.",
    template: "%s · Snug",
  },
  applicationName: "Snug",
  description: DESCRIPTION,
  keywords: ["winter fashion", "winter jackets", "hoodies", "sweaters", "price comparison India"],
  alternates: { canonical: "/" },
  // Kept out of search results until ALLOW_INDEXING=true (see src/lib/site.ts).
  robots: ALLOW_INDEXING ? { index: true, follow: true } : { index: false, follow: false },
  // OG/Twitter images come from app/opengraph-image.tsx (file convention).
  openGraph: {
    type: "website",
    siteName: "Snug",
    title: "Snug — Stay Warm. Spend Less.",
    description: DESCRIPTION,
    url: "/",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Snug — Stay Warm. Spend Less.",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1B3F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${sans.variable} ${display.variable}`}>
      <body className="relative isolate flex min-h-screen flex-col">
        <WinterBackdrop className="h-[620px] md:h-[780px]" />
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
          Skip to content
        </a>
        <WishlistProvider>
          <PromoBar />
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </WishlistProvider>
      </body>
    </html>
  );
}
