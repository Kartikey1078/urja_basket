import {
  CATALOG_CANVAS_HEIGHT,
  CATALOG_CANVAS_WIDTH,
  CATALOG_PLACEHOLDER_IMAGE,
} from "@/lib/catalog/constants";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image blob"));
    reader.readAsDataURL(blob);
  });
}

/** Strip Tailwind classes — avoids unsupported colors in headless render. */
function stripClasses(root: HTMLElement): void {
  root.removeAttribute("class");
  root.querySelectorAll("[class]").forEach((el) => el.removeAttribute("class"));
}

/** Inline every <img> as a data URL for self-contained export HTML. */
async function inlineImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));

  await Promise.all(
    images.map(async (img) => {
      const fallback = img.getAttribute("data-fallback") ?? CATALOG_PLACEHOLDER_IMAGE;
      const src = img.getAttribute("src");
      if (!src || src.startsWith("data:")) return;

      try {
        const res = await fetch(src, { credentials: "include" });
        if (!res.ok) {
          img.src = fallback;
          return;
        }
        const blob = await res.blob();
        img.src = await blobToDataUrl(blob);
      } catch {
        img.src = fallback;
      }
      img.removeAttribute("crossorigin");
    })
  );
}

function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        })
    )
  ).then(() => undefined);
}

/** Build a standalone HTML document from the live preview node for Puppeteer. */
export async function prepareCatalogExportHtml(node: HTMLElement): Promise<string> {
  const clone = node.cloneNode(true) as HTMLElement;
  stripClasses(clone);
  clone.style.width = `${CATALOG_CANVAS_WIDTH}px`;
  clone.style.height = `${CATALOG_CANVAS_HEIGHT}px`;
  clone.style.minWidth = `${CATALOG_CANVAS_WIDTH}px`;
  clone.style.minHeight = `${CATALOG_CANVAS_HEIGHT}px`;
  clone.style.maxWidth = `${CATALOG_CANVAS_WIDTH}px`;
  clone.style.maxHeight = `${CATALOG_CANVAS_HEIGHT}px`;
  clone.style.margin = "0";
  clone.style.overflow = "hidden";

  await inlineImages(clone);
  await waitForImages(clone);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=${CATALOG_CANVAS_WIDTH}, height=${CATALOG_CANVAS_HEIGHT}" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: ${CATALOG_CANVAS_WIDTH}px;
      height: ${CATALOG_CANVAS_HEIGHT}px;
      overflow: hidden;
      background: #faf8f2;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</head>
<body>${clone.outerHTML}</body>
</html>`;
}
