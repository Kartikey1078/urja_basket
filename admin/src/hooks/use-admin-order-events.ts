"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useAdminOrderEvents() {
  const qc = useQueryClient();

  useEffect(() => {
    const es = new EventSource("/api/admin/events");

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as { type?: string };
        if (payload.type === "order.created" || payload.type === "order.updated") {
          void qc.invalidateQueries({ queryKey: ["admin", "orders"] });
        }
      } catch {
        // ignore malformed events
      }
    };

    return () => es.close();
  }, [qc]);
}
