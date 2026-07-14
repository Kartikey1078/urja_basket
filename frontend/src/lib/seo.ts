import type { Metadata } from "next";

import { FOOTER } from "@/lib/footer-constants";
import { SHOP_CATEGORIES } from "@/lib/shop-categories";

export const SITE_NAME = FOOTER.brand;

export const DEFAULT_DESCRIPTION =
  "Order fresh fruits, premium dry fruits, nuts & seeds online in Delhi. Free delivery, hygienically packed, delivered in ~30 minutes.";

export const DEFAULT_KEYWORDS = [
  "Urja Basket",
  "fresh fruits delivery Delhi",
  "dry fruits online",
  "nuts and seeds delivery",
  "fruit shop Delhi",
  "dry fruits store near me",
  "online grocery Delhi",
  "fast fruit delivery",
] as const;

/** Public site URL for canonical links, OG tags, and sitemap. Set in production. */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "http://localhost:3000";
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/$/, "");
  }
  return `https://${raw.replace(/\/$/, "")}`;
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export const NOINDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

type PageMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  ogImage?: string;
  keywords?: string[];
};

export function createPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  noindex = false,
  ogImage = "/home/UrjaBasket.png",
  keywords,
}: PageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    keywords: keywords ?? [...DEFAULT_KEYWORDS],
    alternates: { canonical },
    robots: noindex ? NOINDEX_ROBOTS : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: canonical,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [
        {
          url: ogImage,
          width: 1672,
          height: 941,
          alt: `${SITE_NAME} — fresh fruits and dry fruits delivery`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

export const CATEGORY_SEO: Record<
  string,
  { description: string; keywords: string[] }
> = {
  "fresh-fruits": {
    description:
      "Buy fresh fruits online in Delhi — seasonal picks, farm-fresh quality, free delivery from Urja Basket.",
    keywords: [
      "fresh fruits online Delhi",
      "buy fruits online",
      "seasonal fruits delivery",
      "Urja Basket fruits",
    ],
  },
  "dry-fruits": {
    description:
      "Shop premium dry fruits online — almonds, cashews, raisins & more. Hygienically packed with fast delivery in Delhi.",
    keywords: [
      "dry fruits online Delhi",
      "buy dry fruits",
      "premium dry fruits delivery",
      "Urja Basket dry fruits",
    ],
  },
  "nuts-seeds": {
    description:
      "Order nuts & seeds online in Delhi — walnuts, pistachios, chia, flax & more from Urja Basket.",
    keywords: [
      "nuts online Delhi",
      "seeds delivery",
      "buy nuts and seeds online",
      "Urja Basket nuts",
    ],
  },
};

export const PUBLIC_ROUTES = [
  { path: "", changeFrequency: "daily" as const, priority: 1 },
  { path: "/categories", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/bestsellers", changeFrequency: "daily" as const, priority: 0.9 },
  ...SHOP_CATEGORIES.map((c) => ({
    path: `/categories/${c.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.85,
  })),
];

export function organizationJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "GroceryStore",
    "@id": `${url}/#organization`,
    name: SITE_NAME,
    url,
    logo: absoluteUrl("/brand/urja-basket-logo.png"),
    image: absoluteUrl("/home/UrjaBasket.png"),
    description: DEFAULT_DESCRIPTION,
    telephone: `+${FOOTER.whatsappDigits}`,
    email: FOOTER.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "D-134, South Ganesh Nagar",
      addressLocality: "Delhi",
      postalCode: "110092",
      addressCountry: "IN",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "08:00",
      closes: "22:00",
    },
    sameAs: [FOOTER.instagramUrl, FOOTER.facebookUrl],
    areaServed: {
      "@type": "City",
      name: "Delhi",
    },
  };
}

export function websiteJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    name: SITE_NAME,
    url,
    publisher: { "@id": `${url}/#organization` },
    inLanguage: "en-IN",
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
