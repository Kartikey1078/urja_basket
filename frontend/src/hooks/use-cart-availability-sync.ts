"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

import { useCartStore } from "@/stores/cart-store";

/** Poll + focus refresh to drop out-of-stock lines from cart and refresh server cart. */
const SYNC_MS = 30_000;

export function useCartAvailabilitySync() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const pruneUnavailableItems = useCartStore((s) => s.pruneUnavailableItems);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    const run = async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        if (isSignedIn) {
          const token = await getToken();
          if (token) await pruneUnavailableItems(token);
        } else {
          await pruneUnavailableItems(null);
        }
      } catch {
        /* best-effort */
      } finally {
        inFlight.current = false;
      }
    };

    void run();
    const onFocus = () => void run();
    window.addEventListener("focus", onFocus);
    const id = window.setInterval(() => void run(), SYNC_MS);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(id);
    };
  }, [getToken, isLoaded, isSignedIn, pruneUnavailableItems]);
}
