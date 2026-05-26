"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

import {
  clearCartMergeSession,
  hasMergedGuestCartThisSession,
  markGuestCartMerged,
} from "@/lib/cart/session";
import { syncCurrentUser } from "@/lib/sync-user";
import { useCartStore } from "@/stores/cart-store";

/**
 * After sign-in or sign-up, calls GET /api/me so the Express API
 * upserts the Clerk profile into MySQL (by clerk_id, no duplicates).
 */
export function ClerkUserSync() {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const lastSyncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) {
      if (!isSignedIn && lastSyncedUserId.current) {
        clearCartMergeSession(lastSyncedUserId.current);
        lastSyncedUserId.current = null;
      }
      return;
    }

    if (lastSyncedUserId.current === userId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const token = await getToken();
        if (!token || cancelled) return;

        const user = await syncCurrentUser(token);
        if (cancelled) return;

        if (user) {
          const allowGuestMerge = !hasMergedGuestCartThisSession(userId);
          await useCartStore
            .getState()
            .loadAuthenticatedCart(token, { allowGuestMerge });
          markGuestCartMerged(userId);
        }
        lastSyncedUserId.current = userId;
      } catch {
        /* API unavailable — guest cart still works */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, userId, getToken]);

  return null;
}
