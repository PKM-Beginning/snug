
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL.replace(/\/$/, "");

  const pages = [
    "/guides",
    "/guides/winter-jackets-under-1500",
    "/info/about",
    "/info/how-it-works",
    "/info/affiliate-disclosure",
    "/info/privacy",
    "/info/terms",
    "/contact",
  ];

  return pages.map((path) => ({
    url: `${base}${path}`,
  }));
}
