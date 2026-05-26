import { getApiBaseUrl } from "@/lib/api";

export type SyncedUser = {
  id: number;
  clerk_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  created_at: string;
};

export async function syncCurrentUser(token: string): Promise<SyncedUser | null> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const body = (await res.json()) as { data?: SyncedUser };
    return body.data ?? null;
  } catch {
    // API offline, CORS, or network error — avoid breaking the storefront
    return null;
  }
}
