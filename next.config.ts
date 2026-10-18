import type { NextConfig } from "next";

// Comma-separated https image hosts permitted by your affiliate programmes
// (also read by src/lib/api/mappers.ts so unknown hosts fall back to placeholders).
const imageHosts = (process.env.IMAGE_REMOTE_HOSTS ?? "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: imageHosts.map((hostname) => ({ protocol: "https" as const, hostname })),
  },
};

export default nextConfig;
