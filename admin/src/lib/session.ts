import { jwtVerify, SignJWT } from "jose";

export const ADMIN_SESSION_COOKIE = "urja_admin";

function getSecretBytes(): Uint8Array | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) return null;
  return new TextEncoder().encode(s);
}

export type AdminSessionPayload = {
  role: "admin";
  adminUserId?: number;
  email?: string;
  name?: string;
  adminRole?: "owner" | "manager" | "staff";
  legacy?: boolean;
};

export async function signAdminSessionJwt(payload?: Omit<AdminSessionPayload, "role">): Promise<string | null> {
  const enc = getSecretBytes();
  if (!enc) return null;
  return new SignJWT({ role: "admin", ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(enc);
}

export async function verifyAdminSessionJwt(token: string): Promise<boolean> {
  const enc = getSecretBytes();
  if (!enc) return false;
  try {
    await jwtVerify(token, enc);
    return true;
  } catch {
    return false;
  }
}
