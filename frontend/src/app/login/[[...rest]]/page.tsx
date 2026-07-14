import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BrandLogo } from "@/components/brand-logo";
import { safeRedirectPath } from "@/lib/auth-redirect";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Sign In",
  description: "Sign in to your Urja Basket account to checkout faster and track orders.",
  path: "/login",
  noindex: true,
});

type LoginPageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { userId } = await auth();
  const params = await searchParams;
  const returnTo = safeRedirectPath(params.redirect_url);

  if (userId) {
    redirect(returnTo);
  }

  return (
    <div className="bg-background mx-auto flex max-w-md flex-col items-center px-4 py-12 sm:py-16">
      <BrandLogo size="2xl" layout="horizontal" href="/" className="mb-6" />
      <SignIn
        forceRedirectUrl={returnTo}
        fallbackRedirectUrl={returnTo}
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "w-full shadow-none",
          },
        }}
      />
      <Link
        href="/"
        className="text-urja-forest mt-6 text-sm font-medium underline-offset-4 hover:underline"
      >
        Back to home
      </Link>
    </div>
  );
}
