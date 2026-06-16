import type { NextConfig } from "next";

function resolveApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (raw) return raw;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_API_URL is required for production builds (Railway storefront)."
    );
  }
  return "http://localhost:4000";
}

const apiBase = resolveApiBase();

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  /** Proxy Express API through Next dev server — same-origin fetches in the browser. */
  async rewrites() {
    return [
      { source: "/api/v1/:path*", destination: `${apiBase}/api/v1/:path*` },
      { source: "/api/me", destination: `${apiBase}/api/me` },
    ];
  },
  async redirects() {
    return [
      { source: "/fruits", destination: "/categories/fresh-fruits", permanent: true },
      { source: "/dry-fruits", destination: "/categories/dry-fruits", permanent: true },
      { source: "/dried-fruits", destination: "/categories/dried-fruits", permanent: true },
      { source: "/nuts-seeds", destination: "/categories/nuts-seeds", permanent: true },
      { source: "/gift-hampers", destination: "/categories/gift-hampers", permanent: true },
      { source: "/trail-mix", destination: "/categories/trail-mix", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "example.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.istockphoto.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.edgeone.app",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
