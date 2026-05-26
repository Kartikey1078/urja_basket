import type { AddressDto, AddressInput, UserAddressRow } from "./address.types";

/** Split stored lines back into form fields (best-effort). */
function parseLines(line1: string, line2: string | null): {
  houseFlat: string;
  floor: string | null;
  building: string | null;
  area: string | null;
} {
  let houseFlat = line1;
  let floor: string | null = null;
  const floorMatch = line1.match(/^(.+?),\s*Floor\s+(.+)$/i);
  if (floorMatch) {
    houseFlat = floorMatch[1].trim();
    floor = floorMatch[2].trim();
  }

  let building: string | null = null;
  let area: string | null = null;
  if (line2) {
    const parts = line2.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      building = parts[0];
      area = parts.slice(1).join(", ");
    } else if (parts.length === 1) {
      area = parts[0];
    }
  }

  return { houseFlat, floor, building, area };
}

export function composeAddressLines(input: AddressInput): {
  line1: string;
  line2: string | null;
} {
  const line1 = input.floor
    ? `${input.houseFlat.trim()}, Floor ${input.floor.trim()}`
    : input.houseFlat.trim();
  const line2Parts = [input.building?.trim(), input.area?.trim()].filter(Boolean);
  const line2 = line2Parts.length > 0 ? line2Parts.join(", ") : null;
  return { line1, line2 };
}

export function rowToDto(row: UserAddressRow): AddressDto {
  const { houseFlat, floor, building, area } = parseLines(
    row.address_line_1,
    row.address_line_2
  );
  const parts = [
    row.address_line_1,
    row.address_line_2,
    row.landmark,
    row.city,
    row.state,
    row.postal_code,
  ].filter(Boolean);

  return {
    id: row.id,
    fullName: row.full_name,
    phoneNumber: row.phone_number,
    alternatePhone: row.alternate_phone,
    houseFlat,
    floor,
    building,
    area,
    landmark: row.landmark,
    city: row.city,
    state: row.state,
    country: row.country,
    postalCode: row.postal_code,
    latitude: row.latitude != null ? Number(row.latitude) : null,
    longitude: row.longitude != null ? Number(row.longitude) : null,
    addressType: row.address_type,
    isDefault: row.is_default === 1,
    formatted: parts.join(", "),
  };
}
