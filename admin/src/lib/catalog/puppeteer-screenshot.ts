import puppeteer, { type Browser } from "puppeteer";

import {
  CATALOG_CANVAS_HEIGHT,
  CATALOG_CANVAS_WIDTH,
} from "@/lib/catalog/constants";

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (browserInstance?.connected) {
    return browserInstance;
  }

  browserInstance = await puppeteer.launch({
    headless: true,
    executablePath: puppeteer.executablePath(),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--font-render-hinting=none",
    ],
  });

  browserInstance.on("disconnected", () => {
    browserInstance = null;
  });

  return browserInstance;
}

/** WhatsApp-friendly JPEG — sRGB, moderate quality for fast mobile thumbnail generation. */
const WHATSAPP_JPEG_QUALITY = 90;

/** Render self-contained catalog HTML in headless Chrome and return JPEG bytes. */
export async function screenshotCatalogHtml(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({
      width: CATALOG_CANVAS_WIDTH,
      height: CATALOG_CANVAS_HEIGHT,
      deviceScaleFactor: 1,
    });

    await page.setContent(html, {
      waitUntil: "load",
      timeout: 30_000,
    });

    await page.evaluate(() => document.fonts.ready);

    const jpeg = await page.screenshot({
      type: "jpeg",
      quality: WHATSAPP_JPEG_QUALITY,
      clip: {
        x: 0,
        y: 0,
        width: CATALOG_CANVAS_WIDTH,
        height: CATALOG_CANVAS_HEIGHT,
      },
      omitBackground: false,
    });

    return Buffer.from(jpeg);
  } finally {
    await page.close();
  }
}
