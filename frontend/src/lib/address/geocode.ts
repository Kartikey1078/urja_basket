export type ReverseGeocodeResult = {
  area: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark: string;
};

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "json");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      address?: Record<string, string>;
    };
    const a = data.address;
    if (!a) return null;

    const area =
      a.neighbourhood ??
      a.suburb ??
      a.road ??
      a.village ??
      a.town ??
      "";
    const city = a.city ?? a.town ?? a.village ?? a.county ?? "";
    const state = a.state ?? "";
    const postalCode = a.postcode?.replace(/\D/g, "").slice(0, 6) ?? "";
    const country = a.country ?? "India";

    return {
      area,
      city,
      state,
      postalCode: postalCode.length === 6 ? postalCode : "",
      country,
      landmark: a.amenity ?? "",
    };
  } catch {
    return null;
  }
}

export function estimateDeliveryMinutes(): number {
  return 12;
}
