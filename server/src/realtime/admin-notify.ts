import type { Response } from "express";

type Client = { res: Response; heartbeat: NodeJS.Timeout };

const clients = new Set<Client>();

export type AdminOrderEvent =
  | { type: "order.created"; orderId: number; orderNumber: string }
  | { type: "order.updated"; orderId: number; orderNumber?: string; status?: string };

export function registerAdminSseClient(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const heartbeat = setInterval(() => {
    res.write(": ping\n\n");
  }, 25_000);

  const client = { res, heartbeat };
  clients.add(client);

  res.on("close", () => {
    clearInterval(heartbeat);
    clients.delete(client);
  });

  res.write(": connected\n\n");
}

export function notifyAdmins(event: AdminOrderEvent) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const { res } of clients) {
    res.write(data);
  }
}
