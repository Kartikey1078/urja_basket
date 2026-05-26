import type { Request, Response } from "express";
import { HttpError } from "../../errors/httpError";
import * as adminUserService from "../admin-users/admin-user.service";

function paramStr(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function parseId(param: string | undefined): number {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "Invalid admin user id");
  }
  return id;
}

function verifyInternalCaller(req: Request): void {
  const secret = process.env.ADMIN_INTERNAL_SECRET ?? process.env.ADMIN_API_KEY;
  const header = req.headers["x-internal-auth"];
  if (!secret || header !== secret) {
    throw new HttpError(401, "Unauthorized");
  }
}

/** Called by the admin Next.js app during sign-in (not protected by ADMIN_API_KEY). */
export async function adminAuthenticate(req: Request, res: Response) {
  verifyInternalCaller(req);
  const body = req.body as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email.trim() || !password) {
    throw new HttpError(400, "email and password are required");
  }
  const user = await adminUserService.authenticateAdminUser(email, password);
  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }
  res.json({ data: user });
}

export async function adminListAdminUsers(_req: Request, res: Response) {
  const data = await adminUserService.listAdminUsers();
  res.json({ data });
}

export async function adminCreateAdminUser(req: Request, res: Response) {
  const input = adminUserService.parseCreateBody(req.body as Record<string, unknown>);
  const data = await adminUserService.createAdminUser(input);
  res.status(201).json({ data });
}

export async function adminUpdateAdminUser(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id));
  const patch = adminUserService.parseUpdateBody(req.body as Record<string, unknown>);
  const data = await adminUserService.updateAdminUser(id, patch);
  res.json({ data });
}

export async function adminDeleteAdminUser(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id));
  await adminUserService.deleteAdminUser(id);
  res.json({ data: { ok: true } });
}
