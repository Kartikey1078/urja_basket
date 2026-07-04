import type { Request, Response } from "express";

import { HttpError } from "../../errors/httpError";
import * as posService from "./pos.service";
import type { PosCartLineInput } from "./pos.types";

function parseId(param: string | string[] | undefined): number {
  const raw = Array.isArray(param) ? param[0] : param;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "Invalid id");
  }
  return id;
}

function parseCartLines(body: unknown): PosCartLineInput[] {
  if (!body || typeof body !== "object" || !("items" in body)) {
    throw new HttpError(400, "items array is required");
  }
  const items = (body as { items: unknown }).items;
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, "Cart is empty");
  }
  return items.map((raw) => {
    if (!raw || typeof raw !== "object") throw new HttpError(400, "Invalid cart line");
    const line = raw as Record<string, unknown>;
    const productId = Number(line.productId);
    const quantity = Number(line.quantity);
    const variantId =
      line.variantId === null || line.variantId === undefined
        ? null
        : Number(line.variantId);
    if (!Number.isInteger(productId) || productId <= 0) throw new HttpError(400, "Invalid productId");
    if (!Number.isInteger(quantity) || quantity <= 0) throw new HttpError(400, "Invalid quantity");
    if (variantId !== null && (!Number.isInteger(variantId) || variantId <= 0)) {
      throw new HttpError(400, "Invalid variantId");
    }
    return { productId, variantId, quantity };
  });
}

export async function searchProducts(req: Request, res: Response) {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const data = await posService.searchProducts(q);
  res.json({ data });
}

export async function createOrder(req: Request, res: Response) {
  const lines = parseCartLines(req.body);
  const data = await posService.createPendingOrder(lines);
  res.status(201).json({ data });
}

export async function checkoutCash(req: Request, res: Response) {
  const lines = parseCartLines(req.body);
  const receivedAmount = Number((req.body as { receivedAmount?: number }).receivedAmount);
  const data = await posService.checkoutCash(lines, receivedAmount);
  res.status(201).json({ data });
}

export async function payCash(req: Request, res: Response) {
  const id = parseId(req.params.id);
  const receivedAmount = Number((req.body as { receivedAmount?: number }).receivedAmount);
  const data = await posService.completeCashPayment(id, receivedAmount);
  res.json({ data });
}

export async function listOrders(req: Request, res: Response) {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const page = typeof req.query.page === "string" ? Number(req.query.page) : 1;
  const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 50;
  const data = await posService.listOrders({ q, status, page, limit });
  res.json(data);
}

export async function getOrder(req: Request, res: Response) {
  const id = parseId(req.params.id);
  const data = await posService.getOrderDetail(id);
  res.json({ data });
}

export async function cancelOrder(req: Request, res: Response) {
  const id = parseId(req.params.id);
  const data = await posService.cancelPendingOrder(id);
  res.json({ data });
}

export async function getInvoice(req: Request, res: Response) {
  const id = parseId(req.params.id);
  const html = await posService.getInvoiceHtml(id);
  res.type("html").send(html);
}
