import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, signAdminSessionJwt } from "@/lib/session";

function apiBase(): string {
  const base = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!base) return "";
  return base.replace(/\/$/, "");
}

function internalAuthHeader(): string | null {
  const secret = process.env.ADMIN_INTERNAL_SECRET ?? process.env.ADMIN_API_KEY;
  return secret && secret.length >= 8 ? secret : null;
}

async function tryDatabaseLogin(email: string, password: string) {
  const base = apiBase();
  const authHeader = internalAuthHeader();
  if (!base || !authHeader) return null;

  try {
    const res = await fetch(`${base}/api/v1/admin/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Auth": authHeader,
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: {
        id: number;
        email: string;
        name: string;
        role: "owner" | "manager" | "staff";
      };
    };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const expected = process.env.ADMIN_APP_PASSWORD;

  let sessionPayload: Parameters<typeof signAdminSessionJwt>[0] | undefined;

  if (email && password) {
    const user = await tryDatabaseLogin(email, password);
    if (user) {
      sessionPayload = {
        adminUserId: user.id,
        email: user.email,
        name: user.name,
        adminRole: user.role,
      };
    }
  }

  if (!sessionPayload) {
    if (!expected || password !== expected) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    sessionPayload = { legacy: true, name: "Bootstrap admin" };
  }

  const token = await signAdminSessionJwt(sessionPayload);
  if (!token) {
    return NextResponse.json(
      { error: "Server misconfigured: set ADMIN_SESSION_SECRET (min 32 chars)" },
      { status: 500 }
    );
  }

  const res = NextResponse.json({
    ok: true,
    user: sessionPayload.adminUserId
      ? {
          id: sessionPayload.adminUserId,
          email: sessionPayload.email,
          name: sessionPayload.name,
          role: sessionPayload.adminRole,
        }
      : { legacy: true, name: sessionPayload.name },
  });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
