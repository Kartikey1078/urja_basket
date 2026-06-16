import type { Request, Response } from "express";
import { HttpError } from "../../errors/httpError";
import * as nutritionTagRepo from "./nutrition-tag.repository";

function paramStr(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function parseId(param: string | undefined, label: string): number {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, `Invalid ${label}`);
  }
  return id;
}

function mapRow(row: nutritionTagRepo.NutritionTagCatalogRow) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    image_url: row.image_url,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function adminListNutritionTags(_req: Request, res: Response) {
  const rows = await nutritionTagRepo.listNutritionTagCatalog();
  res.json({ data: rows.map(mapRow) });
}

export async function adminCreateNutritionTag(req: Request, res: Response) {
  const b = req.body as Record<string, unknown>;
  if (typeof b.name !== "string" || !b.name.trim()) {
    throw new HttpError(400, "name is required");
  }
  const insertId = await nutritionTagRepo.insertNutritionTag({
    name: b.name,
    slug: typeof b.slug === "string" ? b.slug : undefined,
    image_url:
      b.image_url === undefined || b.image_url === null
        ? null
        : String(b.image_url),
    sort_order: b.sort_order === undefined ? 0 : Number(b.sort_order),
  });
  res.status(201).json({ data: { id: insertId } });
}

export async function adminUpdateNutritionTag(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "nutrition tag id");
  const b = req.body as Record<string, unknown>;
  const patch: Parameters<typeof nutritionTagRepo.updateNutritionTag>[1] = {};
  if (b.name !== undefined) patch.name = String(b.name);
  if (b.slug !== undefined) patch.slug = String(b.slug);
  if (b.image_url !== undefined) {
    patch.image_url = b.image_url === null ? null : String(b.image_url);
  }
  if (b.sort_order !== undefined) patch.sort_order = Number(b.sort_order);
  const ok = await nutritionTagRepo.updateNutritionTag(id, patch);
  if (!ok) throw new HttpError(404, "Nutrition tag not found");
  res.json({ data: { ok: true } });
}

export async function adminDeleteNutritionTag(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "nutrition tag id");
  await nutritionTagRepo.deleteNutritionTag(id);
  res.status(204).send();
}
