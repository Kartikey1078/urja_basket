import { z } from "zod";

const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .transform((v) => v.replace(/\D/g, ""))
  .refine(
    (digits) => {
      const n =
        digits.length === 12 && digits.startsWith("91")
          ? digits.slice(2)
          : digits.length === 11 && digits.startsWith("0")
            ? digits.slice(1)
            : digits;
      return /^[6-9]\d{9}$/.test(n);
    },
    { message: "Enter a valid 10-digit Indian mobile number" }
  );

const optionalPhoneSchema = z
  .string()
  .optional()
  .refine(
    (v) => {
      if (!v?.trim()) return true;
      const digits = v.replace(/\D/g, "");
      const n =
        digits.length === 12 && digits.startsWith("91")
          ? digits.slice(2)
          : digits.length === 11 && digits.startsWith("0")
            ? digits.slice(1)
            : digits;
      return /^[6-9]\d{9}$/.test(n);
    },
    { message: "Enter a valid alternate mobile number" }
  );

export const addressFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(120),
  phoneNumber: phoneSchema,
  alternatePhone: optionalPhoneSchema,
  houseFlat: z.string().min(1, "House / flat is required").max(255),
  floor: z.string().max(50).optional(),
  building: z.string().max(255).optional(),
  area: z.string().min(2, "Area / street is required").max(255),
  landmark: z.string().max(255).optional(),
  city: z.string().min(2, "City is required").max(120),
  state: z.string().min(2, "State is required").max(120),
  country: z.string().min(2, "Country is required").max(120),
  postalCode: z
    .string()
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  addressType: z.enum(["home", "work", "other"]),
  isDefault: z.boolean().optional(),
});

export type AddressFormSchema = z.infer<typeof addressFormSchema>;
