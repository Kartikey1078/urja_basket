export type AddressType = "home" | "work" | "other";

export type UserAddressRow = {
  id: number;
  user_id: number;
  full_name: string;
  phone_number: string;
  alternate_phone: string | null;
  address_line_1: string;
  address_line_2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: string | null;
  longitude: string | null;
  address_type: AddressType;
  is_default: number;
  created_at: Date;
  updated_at: Date;
};

export type AddressDto = {
  id: number;
  fullName: string;
  phoneNumber: string;
  alternatePhone: string | null;
  houseFlat: string;
  floor: string | null;
  building: string | null;
  area: string | null;
  landmark: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  addressType: AddressType;
  isDefault: boolean;
  formatted: string;
};

export type AddressInput = {
  fullName: string;
  phoneNumber: string;
  alternatePhone?: string | null;
  houseFlat: string;
  floor?: string | null;
  building?: string | null;
  area?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  country?: string;
  postalCode: string;
  latitude?: number | null;
  longitude?: number | null;
  addressType?: AddressType;
  isDefault?: boolean;
};
