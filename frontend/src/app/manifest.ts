import type { MetadataRoute } from "next";

import { SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f3324",
    icons: [
      {
        src: "/brand/urja-basket-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
