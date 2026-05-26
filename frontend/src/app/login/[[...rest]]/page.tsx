import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Login | Urja Basket",
  description: "Sign in to your Urja Basket account.",
};

export default async function LoginPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/");
  }

  return (
    <div className="bg-background mx-auto flex max-w-md flex-col items-center px-4 py-12 sm:py-16">
      <SignIn
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
