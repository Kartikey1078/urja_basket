import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { screenshotCatalogPage } from "@/lib/catalog/puppeteer-screenshot";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionJwt } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Vercel Pro — catalog screenshot needs headless Chrome + image fetches. */
export const maxDuration = 60;

const ALLOWED_SLUGS = new Set(["fresh-fruits", "dry-fruits"]);

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token || !(await verifyAdminSessionJwt(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { categorySlug?: string; pageIndex?: number };
  try {
    body = (await req.json()) as { categorySlug?: string; pageIndex?: number };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const categorySlug = body.categorySlug?.trim();
  if (!categorySlug || !ALLOWED_SLUGS.has(categorySlug)) {
    return NextResponse.json(
      { error: "categorySlug must be fresh-fruits or dry-fruits" },
      { status: 400 }
    );
  }

  const pageIndex = Number.isFinite(body.pageIndex) ? Math.max(0, Number(body.pageIndex)) : 0;

  try {
    const exportUrl = new URL("/catalog-export-frame", req.nextUrl.origin);
    exportUrl.searchParams.set("slug", categorySlug);
    exportUrl.searchParams.set("page", String(pageIndex));

    const jpeg = await screenshotCatalogPage(exportUrl.toString(), {
      cookieName: ADMIN_SESSION_COOKIE,
      cookieValue: token,
      domain: req.nextUrl.hostname,
    });

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
