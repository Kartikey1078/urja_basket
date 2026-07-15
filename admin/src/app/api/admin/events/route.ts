import type { NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE, verifyAdminSessionJwt } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token || !(await verifyAdminSessionJwt(token))) {
    return new Response("Unauthorized", { status: 401 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${apiBase()}/api/v1/admin/events`, {
      headers: { Authorization: `Bearer ${adminKey()}` },
      cache: "no-store",
      signal: req.signal,
    });
  } catch (e) {
    if (req.signal.aborted) {
      return new Response(null, { status: 499 });
    }
    const message = e instanceof Error ? e.message : "Upstream fetch failed";
    return new Response(message, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream error", { status: upstream.status || 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
