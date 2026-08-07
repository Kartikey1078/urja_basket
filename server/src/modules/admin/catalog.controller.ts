import type { Request, Response } from "express";
import * as catalogService from "./catalog.service";

function paramStr(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export async function adminGetCatalog(req: Request, res: Response) {
  const categorySlug = paramStr(req.params.categorySlug);
  if (!categorySlug?.trim()) {
    res.status(400).json({ error: "categorySlug is required" });
    return;
  }

  const data = await catalogService.getCatalogByCategorySlug(categorySlug);
  res.json({ data });
}
