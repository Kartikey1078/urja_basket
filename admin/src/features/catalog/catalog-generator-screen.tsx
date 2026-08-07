"use client";

import { useQuery } from "@tanstack/react-query";
import { Download, ImageIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { AdminPageLoader } from "@/components/loader";
import { CatalogPreviewTemplate } from "@/features/catalog/catalog-preview-template";
import { adminFetchJson } from "@/lib/api-client";
import { adminToast } from "@/lib/admin-toast";
import {
  CATALOG_PRODUCTS_PER_PAGE,
  CATALOG_SECTIONS,
  paginateCatalogProducts,
  type CatalogPayload,
} from "@/lib/catalog/constants";
import { exportCatalogPageToJpeg } from "@/lib/catalog/export-catalog-image";
import { formatCatalogDate } from "@/lib/catalog/format";
import { cn } from "@/lib/cn";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function CatalogSectionCard({
  slug,
  title,
  theme,
}: (typeof CATALOG_SECTIONS)[number]) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const query = useQuery({
    queryKey: ["admin", "catalog", slug],
    queryFn: () =>
      adminFetchJson<{ data: CatalogPayload }>(`catalog/${slug}`).then((r) => r.data),
  });

  const pages = useMemo(
    () => (query.data ? paginateCatalogProducts(query.data.products) : []),
    [query.data]
  );

  const handleDownload = async () => {
    if (!query.data?.products.length) {
      adminToast.fromError(new Error("No products to export"));
      return;
    }

    setExporting(true);
    try {
      const stamp = formatCatalogDate(query.data?.generatedAt).replace(/\s/g, "-");
      const total = pages.length;

      for (let i = 0; i < total; i++) {
        const pageSuffix = total > 1 ? `-page-${i + 1}` : "";
        await exportCatalogPageToJpeg({
          categorySlug: slug,
          pageIndex: i,
          filename: `urja-${slug}-catalog-${stamp}${pageSuffix}.jpeg`,
        });
        if (i < total - 1) await sleep(400);
      }

      adminToast.success(
        total > 1
          ? `${total} catalog images downloaded (${CATALOG_PRODUCTS_PER_PAGE} products each).`
          : "Catalog image downloaded."
      );
    } catch (e) {
      adminToast.fromError(e, "Download failed. Try again or refresh the page.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <ImageIcon className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">{title}</h2>
              <p className="text-xs text-slate-500">
                {query.data?.products.length ?? "—"} in-stock products
                {pages.length > 1 ? ` · ${pages.length} pages` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={exporting || query.isLoading || query.isError || !query.data?.products.length}
            className={cn(
              "inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white",
              "bg-emerald-700 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <Download className="size-4" aria-hidden />
            {exporting
              ? "Generating…"
              : pages.length > 1
                ? `Download ${pages.length} Images`
                : "Download Image"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-slate-100 p-3 sm:p-4">
        {query.isLoading ? (
          <AdminPageLoader label="Loading catalog products…" />
        ) : query.isError ? (
          <p className="py-12 text-center text-sm text-red-700">
            Could not load catalog. Check API connection.
          </p>
        ) : query.data ? (
          <div
            ref={previewRef}
            className="mx-auto flex w-fit max-w-full flex-col gap-6 sm:gap-8"
          >
            {pages.map((pageProducts, index) => (
              <CatalogPreviewTemplate
                key={`${slug}-page-${index + 1}`}
                catalog={{ ...query.data, products: pageProducts }}
                title={title}
                theme={theme}
                pageIndex={index + 1}
                totalPages={pages.length}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function CatalogGeneratorScreen() {
  return (
    <div>
      <PageHeader
        title="Catalog Image Generator"
        description={`Download premium 1080×1500 JPEG catalog images for WhatsApp. ${CATALOG_PRODUCTS_PER_PAGE} products per page; extra products auto-split into separate pages.`}
      />

      <div className="grid gap-8 xl:grid-cols-1">
        {CATALOG_SECTIONS.map((section) => (
          <CatalogSectionCard key={section.slug} {...section} />
        ))}
      </div>
    </div>
  );
}
