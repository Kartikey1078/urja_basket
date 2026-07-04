"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

import {
  clearCartMergeSession,
  clearGuestSession,
  hasActiveGuestSession,
  hasMergedGuestCartThisSession,
  markGuestCartMerged,
  startGuestSession,
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
        useCartStore.getState().resetForGuestSession();
        startGuestSession();
        lastSyncedUserId.current = null;
      }
      return;
    }

    if (lastSyncedUserId.current === userId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      useCartStore.setState({ syncing: true, error: null });
      try {
        const token = await getToken();
        if (!token || cancelled) return;

        const user = await syncCurrentUser(token);
        if (cancelled) return;

        if (user) {
          const allowGuestMerge = !hasMergedGuestCartThisSession(userId);
          const mergeStrategy = hasActiveGuestSession() ? "replace" : "add";
          await useCartStore
            .getState()
            .loadAuthenticatedCart(token, { allowGuestMerge, mergeStrategy });
          markGuestCartMerged(userId);
          clearGuestSession();
        } else {
          await useCartStore.getState().fetchCart(token);
        }
        lastSyncedUserId.current = userId;
      } catch {
        /* API unavailable — try loading server cart if signed in */
        try {
          const token = await getToken();
          if (token && !cancelled) {
            await useCartStore.getState().fetchCart(token);
          }
        } catch {
          /* guest cart still works */
        }
      } finally {
        if (!cancelled) {
          const { syncing } = useCartStore.getState();
          if (syncing) {
            useCartStore.setState({ syncing: false });
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, userId, getToken]);

  return null;
}
