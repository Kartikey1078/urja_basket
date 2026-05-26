import type { Request, Response } from "express";
import * as categoryService from "../services/category.service";

export async function list(_req: Request, res: Response) {
  const data = await categoryService.listCategories();
  res.json({ data });
}

export async function getBySlug(req: Request, res: Response) {
  const raw = req.params.slug;
  const slug = Array.isArray(raw) ? raw[0] : raw;
  if (!slug) {
    res.status(400).json({ error: "slug is required" });
    return;
  }
  const data = await categoryService.getCategoryBySlug(slug);
  res.json({ data });
}
