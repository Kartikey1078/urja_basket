import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, verifyAdminSessionJwt } from "@/lib/session";

export const runtime = "nodejs";

function apiBase(): string {
  const base = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("Missing INTERNAL_API_URL or NEXT_PUBLIC_API_URL");
  return base.replace(/\/$/, "");
}

function adminKey(): string {
  const k = process.env.ADMIN_API_KEY;
  if (!k || k.length < 8) throw new Error("Missing ADMIN_API_KEY (min 8 chars)");
  return k;
}

async function requireSession(req: NextRequest): Promise<NextResponse | null> {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token || !(await verifyAdminSessionJwt(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

async function proxy(req: NextRequest, segments: string[]) {
  const denied = await requireSession(req);
  if (denied) return denied;

  const subpath = segments.join("/");
  const target = new URL(`${apiBase()}/api/v1/admin/${subpath}`);
  req.nextUrl.searchParams.forEach((v, k) => {
    target.searchParams.set(k, v);
  });

  const method = req.method;
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${adminKey()}`);
  const contentType = req.headers.get("content-type");
  if (contentType && method !== "GET" && method !== "HEAD") {
    headers.set("content-type", contentType);
  }

  const body =
    method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      cache: "no-store",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upstream fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const outHeaders = new Headers();
  const ct = upstream.headers.get("content-type");
  if (ct) outHeaders.set("content-type", ct);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
