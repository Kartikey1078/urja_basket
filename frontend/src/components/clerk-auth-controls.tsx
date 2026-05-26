"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

import { cn } from "@/lib/utils";

const actionClassName =
  "rounded-md px-2.5 py-1.5 text-sm font-medium text-urja-forest transition hover:bg-black/5";

export function ClerkAuthControls({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button type="button" className={actionClassName}>
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button type="button" className={actionClassName}>
            Sign up
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-8",
            },
          }}
        />
      </Show>
    </div>
  );
}
