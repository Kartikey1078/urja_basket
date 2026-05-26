import type { Request, Response } from "express";

import * as analyticsRepo from "./repositories/admin-analytics.repository";

export async function adminGetAnalytics(_req: Request, res: Response) {
  const data = await analyticsRepo.getAnalyticsOverview();
  res.json({ data });
}
