import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { fetchProductDetail } from "@/lib/product-detail";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug?.trim()) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }
  const data = await fetchProductDetail(slug.trim());
  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
