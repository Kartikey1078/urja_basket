import { redirect } from "next/navigation";

/** Standalone admin app (see repo `/admin`). */
const DEFAULT_ADMIN_ORIGIN = "http://localhost:3001";

export default async function LegacyAdminRedirect({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const base = (process.env.NEXT_PUBLIC_ADMIN_URL ?? DEFAULT_ADMIN_ORIGIN).replace(/\/$/, "");
  const path = slug?.filter(Boolean).join("/") ?? "";
  if (path) {
    redirect(`${base}/${path}`);
  }
  redirect(`${base}/login`);
}
