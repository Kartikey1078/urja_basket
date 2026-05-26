import { getAuth } from "@clerk/express";
import type { Request, Response } from "express";

import { HttpError } from "../../../errors/httpError";
import * as addressService from "../services/address.service";
import {
  parseAddressBody,
  parsePositiveInt,
} from "../validators/address.validator";

function clerkIdFromRequest(req: Request): string {
  const clerkId = getAuth(req).userId;
  if (!clerkId) {
    throw new HttpError(401, "Unauthorized");
  }
  return clerkId;
}

export async function listAddresses(req: Request, res: Response) {
  const data = await addressService.listAddresses(clerkIdFromRequest(req));
  res.json({ data });
}

export async function createAddress(req: Request, res: Response) {
  const body = parseAddressBody(req.body);
  const data = await addressService.createAddress(clerkIdFromRequest(req), body);
  res.status(201).json({ data });
}

function paramId(req: Request): number {
  const raw = req.params.id;
  return parsePositiveInt(Array.isArray(raw) ? raw[0] : raw, "address id");
}

export async function updateAddress(req: Request, res: Response) {
  const id = paramId(req);
  const body = parseAddressBody(req.body);
  const data = await addressService.updateAddress(clerkIdFromRequest(req), id, body);
  res.json({ data });
}

export async function deleteAddress(req: Request, res: Response) {
  const id = paramId(req);
  await addressService.deleteAddress(clerkIdFromRequest(req), id);
  res.status(204).send();
}

export async function setDefaultAddress(req: Request, res: Response) {
  const id = paramId(req);
  const data = await addressService.setDefaultAddress(clerkIdFromRequest(req), id);
  res.json({ data });
}
