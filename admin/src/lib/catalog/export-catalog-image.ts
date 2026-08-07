function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Export fixed 1080×1500 JPEG via server-side Puppeteer (small JSON payload — Vercel-safe). */
export async function exportCatalogPageToJpeg(options: {
  categorySlug: string;
  pageIndex: number;
  filename: string;
}): Promise<void> {
  const res = await fetch("/api/catalog-export", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      categorySlug: options.categorySlug,
      pageIndex: options.pageIndex,
    }),
  });

  if (!res.ok) {
    let message = "Catalog export failed";
    try {
      const err = (await res.json()) as { error?: string };
      if (err.error) message = err.error;
    } catch {
      message = res.statusText || message;
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  if (!blob.size) {
    throw new Error("Empty catalog image returned");
  }

  triggerDownload(blob, options.filename);
}
