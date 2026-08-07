import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { screenshotCatalogHtml } from "@/lib/catalog/puppeteer-screenshot";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionJwt } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_HTML_BYTES = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token || !(await verifyAdminSessionJwt(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { html?: string };
  try {
    body = (await req.json()) as { html?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const html = body.html?.trim();
  if (!html) {
    return NextResponse.json({ error: "html is required" }, { status: 400 });
  }

  if (Buffer.byteLength(html, "utf8") > MAX_HTML_BYTES) {
    return NextResponse.json({ error: "html payload too large" }, { status: 413 });
  }

  try {
    const jpeg = await screenshotCatalogHtml(html);
    return new NextResponse(new Uint8Array(jpeg), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
