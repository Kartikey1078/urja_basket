export type AddressType = "home" | "work" | "other";

export type DeliveryAddress = {
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

export type AddressFormValues = {
  fullName: string;
  phoneNumber: string;
  alternatePhone: string;
  houseFlat: string;
  floor: string;
  building: string;
  area: string;
  landmark: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  addressType: AddressType;
  isDefault: boolean;
};

export const emptyAddressForm = (): AddressFormValues => ({
  fullName: "",
  phoneNumber: "",
  alternatePhone: "",
  houseFlat: "",
  floor: "",
  building: "",
  area: "",
  landmark: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
  latitude: null,
  longitude: null,
  addressType: "home",
  isDefault: false,
});

export function addressToFormValues(a: DeliveryAddress): AddressFormValues {
  return {
    fullName: a.fullName,
    phoneNumber: a.phoneNumber,
    alternatePhone: a.alternatePhone ?? "",
    houseFlat: a.houseFlat,
    floor: a.floor ?? "",
    building: a.building ?? "",
    area: a.area ?? "",
    landmark: a.landmark ?? "",
    city: a.city,
    state: a.state,
    country: a.country,
    postalCode: a.postalCode,
    latitude: a.latitude,
    longitude: a.longitude,
    addressType: a.addressType,
    isDefault: a.isDefault,
  };
}

export function formValuesToDeliveryAddress(
  values: AddressFormValues,
  id = 0
): DeliveryAddress {
  const p = formValuesToPayload(values);
  const line1 = p.floor ? `${p.houseFlat}, Floor ${p.floor}` : p.houseFlat;
  const line2 = [p.building, p.area].filter(Boolean).join(", ");
  const formatted = [line1, line2 || null, p.landmark, p.city, p.state, p.postalCode]
    .filter(Boolean)
    .join(", ");
  return {
    id,
    fullName: p.fullName,
    phoneNumber: p.phoneNumber,
    alternatePhone: p.alternatePhone,
    houseFlat: p.houseFlat,
    floor: p.floor,
    building: p.building,
    area: p.area,
    landmark: p.landmark,
    city: p.city,
    state: p.state,
    country: p.country,
    postalCode: p.postalCode,
    latitude: p.latitude ?? null,
    longitude: p.longitude ?? null,
    addressType: p.addressType ?? "home",
    isDefault: p.isDefault ?? false,
    formatted,
  };
}

export function formValuesToPayload(values: AddressFormValues) {
  return {
    fullName: values.fullName.trim(),
    phoneNumber: values.phoneNumber.trim(),
    alternatePhone: values.alternatePhone.trim() || null,
    houseFlat: values.houseFlat.trim(),
    floor: values.floor.trim() || null,
    building: values.building.trim() || null,
    area: values.area.trim() || null,
    landmark: values.landmark.trim() || null,
    city: values.city.trim(),
    state: values.state.trim(),
    country: values.country.trim() || "India",
    postalCode: values.postalCode.trim(),
    latitude: values.latitude,
    longitude: values.longitude,
    addressType: values.addressType,
    isDefault: values.isDefault,
  };
}
