import { redirect } from "next/navigation";

/** Standalone admin app (see repo `/admin`). */
function adminOrigin(): string {
  const base = process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, "");
  if (base) return base;
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_ADMIN_URL is required in production.");
  }
  return "http://localhost:3001";
}

export default async function LegacyAdminRedirect({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const base = adminOrigin();
  const path = slug?.filter(Boolean).join("/") ?? "";
  if (path) {
    redirect(`${base}/${path}`);
  }
  redirect(`${base}/login`);
}
