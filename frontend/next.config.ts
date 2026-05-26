import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
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
    ],
  },
};

export default nextConfig;
