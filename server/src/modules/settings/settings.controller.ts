import type { Request, Response } from "express";
import * as settingsService from "./settings.service";

export async function getPublicSettings(_req: Request, res: Response) {
  const settings = await settingsService.getSiteSettings();
  res.json({ data: settingsService.toPublicSettings(settings) });
}
