import type { Request, Response } from "express";
import * as settingsService from "../settings/settings.service";

export async function adminGetSettings(_req: Request, res: Response) {
  const data = await settingsService.getSiteSettings();
  res.json({ data });
}

export async function adminUpdateSettings(req: Request, res: Response) {
  const body = req.body as Record<string, unknown>;
  const data = await settingsService.updateSiteSettings(body);
  res.json({ data });
}
