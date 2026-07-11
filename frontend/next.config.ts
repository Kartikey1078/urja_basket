import type { NextConfig } from "next";

import { resolvePublicApiBaseUrl } from "./src/lib/api-base-url";

const apiBase = resolvePublicApiBaseUrl();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // turbopack: {
  //   root: __dirname,
  // },
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
      {
        protocol: "https",
        hostname: "cdn.phototourl.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
