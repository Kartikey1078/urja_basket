import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { ClerkUserSync } from "@/components/clerk-user-sync";
import { ConditionalSiteChrome } from "@/components/conditional-site-chrome";
import { Providers } from "@/components/providers";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  getSiteUrl,
} from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const urjaSerif = Playfair_Display({
  variable: "--font-urja-serif",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} — Fresh Fruits & Dry Fruits Delivery in Delhi`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [...DEFAULT_KEYWORDS],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: getSiteUrl() }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: true, email: true },
  icons: {
    icon: "/brand/urja-basket-logo.png",
    apple: "/brand/urja-basket-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Fresh Fruits & Dry Fruits Delivery in Delhi`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/home/UrjaBasket.png",
        width: 1672,
        height: 941,
        alt: `${SITE_NAME} — nourish naturally, live energetically`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Fresh Fruits & Dry Fruits Delivery in Delhi`,
    description: DEFAULT_DESCRIPTION,
    images: ["/home/UrjaBasket.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${urjaSerif.variable} h-full bg-white antialiased`}
    >
      <body className="flex min-h-full min-w-0 flex-col bg-white">
        <ClerkProvider>
          <ClerkUserSync />
          <Providers>
            <ConditionalSiteChrome>{children}</ConditionalSiteChrome>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
