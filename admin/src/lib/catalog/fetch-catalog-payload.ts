import type { CatalogPayload } from "@/lib/catalog/constants";

function apiBase(): string {
  const base = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!base?.trim()) {
    throw new Error("Missing INTERNAL_API_URL or NEXT_PUBLIC_API_URL");
  }
  return base.replace(/\/+$/, "");
}

function adminKey(): string {
  const key = process.env.ADMIN_API_KEY;
  if (!key || key.length < 8) {
    throw new Error("Missing ADMIN_API_KEY (min 8 chars)");
  }
  return key;
}

/** Fetch live catalog rows from Express admin API (server-only). */
export async function fetchCatalogPayload(categorySlug: string): Promise<CatalogPayload> {
  const slug = categorySlug.trim();
  const res = await fetch(
    `${apiBase()}/api/v1/admin/catalog/${encodeURIComponent(slug)}`,
    {
      headers: { Authorization: `Bearer ${adminKey()}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Catalog fetch failed (${res.status})`);
  }

  const body = (await res.json()) as { data?: CatalogPayload };
  if (!body.data) {
    throw new Error("Invalid catalog response");
  }

  return body.data;
}
