export class AdminApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

type AdminFetchOptions = RequestInit & {
  json?: unknown;
};

export async function adminFetchJson<T>(path: string, init?: AdminFetchOptions): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const url = `/api/backend/${path.replace(/^\//, "")}`;
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers,
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new AdminApiError(res.status, text || res.statusText);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (text ? JSON.parse(text) : undefined) as T;
}
