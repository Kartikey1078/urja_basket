import { NextRequest, NextResponse } from "next/server";

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="#f1f5f9"/><text x="320" y="185" text-anchor="middle" fill="#94a3b8" font-family="Arial,sans-serif" font-size="22">No image</text></svg>`;

function isAllowedImageUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function placeholderResponse(): NextResponse {
  return new NextResponse(PLACEHOLDER_SVG, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw?.trim()) {
    return placeholderResponse();
  }

  if (!isAllowedImageUrl(raw)) {
    return placeholderResponse();
  }

  try {
    const upstream = await fetch(raw, { cache: "no-store" });
    if (!upstream.ok) {
      return placeholderResponse();
    }

    const bytes = await upstream.arrayBuffer();
    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return placeholderResponse();
  }
}
