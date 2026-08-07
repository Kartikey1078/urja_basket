import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { CatalogPreviewTemplate } from "@/features/catalog/catalog-preview-template";
import {
  CATALOG_CANVAS_HEIGHT,
  CATALOG_CANVAS_WIDTH,
  CATALOG_SECTIONS,
  paginateCatalogProducts,
} from "@/lib/catalog/constants";
import { fetchCatalogPayload } from "@/lib/catalog/fetch-catalog-payload";

const ALLOWED_SLUGS = new Set(["fresh-fruits", "dry-fruits"]);

type Props = {
  searchParams: Promise<{ slug?: string; page?: string }>;
};

async function resolveAssetOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return "http://localhost:3001";
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

/** Headless export frame — loaded by Puppeteer during catalog JPEG generation. */
export default async function CatalogExportFramePage({ searchParams }: Props) {
  const params = await searchParams;
  const slug = params.slug?.trim();
  if (!slug || !ALLOWED_SLUGS.has(slug)) notFound();

  const pageIndex = Number.isFinite(Number(params.page))
    ? Math.max(0, Number(params.page))
    : 0;

  const section = CATALOG_SECTIONS.find((s) => s.slug === slug);
  if (!section) notFound();

  const payload = await fetchCatalogPayload(slug);
  const pages = paginateCatalogProducts(payload.products);
  const pageProducts = pages[pageIndex];
  if (!pageProducts) notFound();

  const assetOrigin = await resolveAssetOrigin();

  return (
    <div
      data-catalog-export-root
      style={{
        width: CATALOG_CANVAS_WIDTH,
        height: CATALOG_CANVAS_HEIGHT,
        margin: 0,
        overflow: "hidden",
        background: "#faf8f2",
      }}
    >
      <CatalogPreviewTemplate
        catalog={{ ...payload, products: pageProducts }}
        title={section.title}
        theme={section.theme}
        pageIndex={pageIndex + 1}
        totalPages={pages.length}
        assetOrigin={assetOrigin}
      />
    </div>
  );
}
