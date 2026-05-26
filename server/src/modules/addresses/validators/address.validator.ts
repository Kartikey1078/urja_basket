import { HttpError } from "../../../errors/httpError";
import type { AddressInput, AddressType } from "../address.types";

const PHONE_RE = /^[6-9]\d{9}$/;
const PINCODE_RE = /^\d{6}$/;
const ADDRESS_TYPES = new Set<AddressType>(["home", "work", "other"]);

function str(v: unknown, field: string, max = 255): string {
  if (typeof v !== "string" || !v.trim()) {
    throw new HttpError(400, `${field} is required`);
  }
  const s = v.trim();
  if (s.length > max) {
    throw new HttpError(400, `${field} is too long`);
  }
  return s;
}

function optionalStr(v: unknown, max = 255): string | null {
  if (v == null || v === "") return null;
  if (typeof v !== "string") {
    throw new HttpError(400, "Invalid string field");
  }
  const s = v.trim();
  if (!s) return null;
  if (s.length > max) {
    throw new HttpError(400, "Field is too long");
  }
  return s;
}

function parsePhone(v: unknown, field: string, required: boolean): string | null {
  if (v == null || v === "") {
    if (required) throw new HttpError(400, `${field} is required`);
    return null;
  }
  const digits = String(v).replace(/\D/g, "");
  const normalized = digits.length === 12 && digits.startsWith("91")
    ? digits.slice(2)
    : digits.length === 11 && digits.startsWith("0")
      ? digits.slice(1)
      : digits;
  if (!PHONE_RE.test(normalized)) {
    throw new HttpError(400, `${field} must be a valid 10-digit Indian mobile number`);
  }
  return normalized;
}

function parseCoord(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) {
    throw new HttpError(400, "Invalid coordinates");
  }
  return n;
}

export function parseAddressBody(body: unknown): AddressInput {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Invalid request body");
  }
  const b = body as Record<string, unknown>;

  const addressType = (b.addressType ?? b.address_type ?? "home") as string;
  if (!ADDRESS_TYPES.has(addressType as AddressType)) {
    throw new HttpError(400, "Invalid address type");
  }

  return {
    fullName: str(b.fullName ?? b.full_name, "Full name", 120),
    phoneNumber: parsePhone(b.phoneNumber ?? b.phone_number, "Phone number", true)!,
    alternatePhone: parsePhone(
      b.alternatePhone ?? b.alternate_phone,
      "Alternate phone",
      false
    ),
    houseFlat: str(b.houseFlat ?? b.house_flat ?? b.address_line_1, "House / flat", 255),
    floor: optionalStr(b.floor, 50),
    building: optionalStr(b.building ?? b.building_name, 255),
    area: optionalStr(b.area ?? b.area_street, 255),
    landmark: optionalStr(b.landmark, 255),
    city: str(b.city, "City", 120),
    state: str(b.state, "State", 120),
    country: optionalStr(b.country, 120) ?? "India",
    postalCode: (() => {
      const pin = String(b.postalCode ?? b.postal_code ?? "").trim();
      if (!PINCODE_RE.test(pin)) {
        throw new HttpError(400, "Postal code must be a 6-digit pincode");
      }
      return pin;
    })(),
    latitude: parseCoord(b.latitude),
    longitude: parseCoord(b.longitude),
    addressType: addressType as AddressType,
    isDefault: Boolean(b.isDefault ?? b.is_default),
  };
}

export function parsePositiveInt(param: string, label: string): number {
  const id = Number(param);
  if (!Number.isInteger(id) || id < 1) {
    throw new HttpError(400, `Invalid ${label}`);
  }
  return id;
}
