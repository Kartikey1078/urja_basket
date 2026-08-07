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

type SessionCookie = {
  cookieName: string;
  cookieValue: string;
  domain: string;
};

/** Open the server-rendered export frame and return a JPEG screenshot. */
export async function screenshotCatalogPage(
  url: string,
  session: SessionCookie
): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({
      width: CATALOG_CANVAS_WIDTH,
      height: CATALOG_CANVAS_HEIGHT,
      deviceScaleFactor: 1,
    });

    if (session.cookieValue) {
      await page.setCookie({
        name: session.cookieName,
        value: session.cookieValue,
        domain: session.domain,
        path: "/",
      });
    }

    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 60_000,
    });

    await page.waitForSelector("[data-catalog-export-root]", { timeout: 15_000 });

    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images).map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) {
                resolve();
                return;
              }
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            })
        )
      );
    });

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
