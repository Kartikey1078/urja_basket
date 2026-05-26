import { getApiBaseUrl } from "@/lib/api";

import type { DeliveryAddress } from "./types";
import { formValuesToPayload, type AddressFormValues } from "./types";

async function addressFetch<T>(
  path: string,
  token: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const body = (await res.json().catch(() => ({}))) as {
    data?: T;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(body.error ?? `Address request failed (${res.status})`);
  }
  if (body.data === undefined) {
    throw new Error("Invalid address response");
  }
  return body.data;
}

export async function fetchAddresses(token: string): Promise<DeliveryAddress[]> {
  return addressFetch<DeliveryAddress[]>("/api/v1/addresses", token);
}

export async function createAddress(
  token: string,
  values: AddressFormValues
): Promise<DeliveryAddress> {
  return addressFetch<DeliveryAddress>("/api/v1/addresses", token, {
    method: "POST",
    body: JSON.stringify(formValuesToPayload(values)),
  });
}

export async function updateAddress(
  token: string,
  id: number,
  values: AddressFormValues
): Promise<DeliveryAddress> {
  return addressFetch<DeliveryAddress>(`/api/v1/addresses/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(formValuesToPayload(values)),
  });
}

export async function deleteAddress(token: string, id: number): Promise<void> {
  await addressFetch<void>(`/api/v1/addresses/${id}`, token, {
    method: "DELETE",
  });
}

export async function setDefaultAddress(
  token: string,
  id: number
): Promise<DeliveryAddress> {
  return addressFetch<DeliveryAddress>(`/api/v1/addresses/${id}/default`, token, {
    method: "PATCH",
  });
}
