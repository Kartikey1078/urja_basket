import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { ClerkUserSync } from "@/components/clerk-user-sync";
import { ConditionalSiteChrome } from "@/components/conditional-site-chrome";
import { Providers } from "@/components/providers";
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
  title: "Urja Basket",
  description: "Next.js app with App Router, Tailwind, and shadcn/ui",
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
