import { getAuth } from "@clerk/express";
import type { Request, Response } from "express";

import { HttpError } from "../../../errors/httpError";
import * as cartService from "../services/cart.service";
import {
  parseAddItemBody,
  parsePositiveInt,
  parseSyncBody,
  parseUpdateQuantityBody,
} from "../validators/cart.validator";

function clerkIdFromRequest(req: Request): string {
  const clerkId = getAuth(req).userId;
  if (!clerkId) {
    throw new HttpError(401, "Unauthorized");
  }
  return clerkId;
}

export async function getCart(req: Request, res: Response) {
  const data = await cartService.getCartForUser(clerkIdFromRequest(req));
  res.json({ data });
}

export async function addItem(req: Request, res: Response) {
  const body = parseAddItemBody(req.body);
  const data = await cartService.addItemToCart(clerkIdFromRequest(req), body);
  res.status(201).json({ data });
}

export async function updateItem(req: Request, res: Response) {
  const raw = req.params.id;
  const lineItemId = parsePositiveInt(Array.isArray(raw) ? raw[0] : raw, "id");
  const { quantity } = parseUpdateQuantityBody(req.body);
  const data = await cartService.updateCartItemQuantity(
    clerkIdFromRequest(req),
    lineItemId,
    quantity
  );
  res.json({ data });
}

export async function removeItem(req: Request, res: Response) {
  const raw = req.params.id;
  const lineItemId = parsePositiveInt(Array.isArray(raw) ? raw[0] : raw, "id");
  const data = await cartService.removeCartItem(clerkIdFromRequest(req), lineItemId);
  res.json({ data });
}

export async function syncGuestCart(req: Request, res: Response) {
  const { items } = parseSyncBody(req.body);
  const data = await cartService.syncGuestCart(clerkIdFromRequest(req), items);
  res.json({ data });
}
