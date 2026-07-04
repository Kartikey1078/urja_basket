"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { FloatingInput } from "@/components/address/floating-input";
import { UrjaLoader } from "@/components/ui/loader";
import { LocationButton } from "@/components/address/location-button";
import {
  addressFormSchema,
  quickCheckoutAddressSchema,
  type AddressFormSchema,
  type QuickCheckoutAddressSchema,
} from "@/lib/address/validation";
import {
  addressToFormValues,
  emptyAddressForm,
  type AddressFormValues,
  type DeliveryAddress,
} from "@/lib/address/types";
import { cn } from "@/lib/utils";

const TYPE_PILLS = [
  { id: "home" as const, label: "Home", emoji: "🏠" },
  { id: "work" as const, label: "Work", emoji: "💼" },
  { id: "other" as const, label: "Other", emoji: "📍" },
];

const DEFAULT_STATE = "Rajasthan";
const DEFAULT_CITY = "Noida";

type AddressFormProps = {
  initial?: DeliveryAddress | AddressFormValues | null;
  submitLabel?: string;
  saving?: boolean;
  embedded?: boolean;
  onCancel?: () => void;
  onSubmit: (values: AddressFormValues) => void | Promise<void>;
};

export function AddressForm({
  initial,
  submitLabel = "Save address",
  saving,
  embedded,
  onCancel,
  onSubmit,
}: AddressFormProps) {
  const compact = embedded;
  const defaults =
    initial == null
      ? emptyAddressForm()
      : "formatted" in initial
        ? addressToFormValues(initial)
        : initial;

  const [showLocation, setShowLocation] = useState(!compact);
  const [autofillPulse, setAutofillPulse] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormSchema | QuickCheckoutAddressSchema>({
    resolver: zodResolver(compact ? quickCheckoutAddressSchema : addressFormSchema),
    defaultValues: defaults,
  });

  const addressType = watch("addressType");
  const houseFlat = watch("houseFlat");
  const area = watch("area");

  useEffect(() => {
    setValue("country", "India");
    if (compact) {
      if (!defaults.state) setValue("state", DEFAULT_STATE);
      if (!defaults.city) setValue("city", DEFAULT_CITY);
    }
  }, [compact, defaults.city, defaults.state, setValue]);

  useEffect(() => {
    if (initial == null) return;
    const values = "formatted" in initial ? addressToFormValues(initial) : initial;
    Object.entries(values).forEach(([key, val]) => {
      setValue(key as keyof AddressFormSchema, val as never);
    });
    if (values.city || values.postalCode) setShowLocation(true);
  }, [initial, setValue]);

  useEffect(() => {
    if (!compact && houseFlat && area && !showLocation) {
      const t = setTimeout(() => setShowLocation(true), 400);
      return () => clearTimeout(t);
    }
  }, [compact, houseFlat, area, showLocation]);

  const handleLocated = (loc: {
    latitude: number;
    longitude: number;
    area?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    landmark?: string;
  }) => {
    if (loc.area) setValue("area", loc.area, { shouldValidate: true });
    if (loc.city) setValue("city", loc.city, { shouldValidate: true });
    if (loc.state) setValue("state", loc.state, { shouldValidate: true });
    if (loc.postalCode) setValue("postalCode", loc.postalCode, { shouldValidate: true });
    if (loc.country) setValue("country", loc.country);
    if (loc.landmark) setValue("landmark", loc.landmark);
    setValue("latitude", loc.latitude);
    setValue("longitude", loc.longitude);
    setShowLocation(true);
    setAutofillPulse(true);
    setTimeout(() => setAutofillPulse(false), 600);
  };

  const submitHandler = handleSubmit((data) => {
    const state =
      ("state" in data && data.state?.trim()) || defaults.state?.trim() || DEFAULT_STATE;
    const city =
      data.city?.trim() || defaults.city?.trim() || (compact ? DEFAULT_CITY : "");
    onSubmit({
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      alternatePhone: compact ? "" : (data as AddressFormSchema).alternatePhone ?? "",
      houseFlat: data.houseFlat,
      floor: compact ? "" : (data as AddressFormSchema).floor ?? "",
      building: compact ? "" : (data as AddressFormSchema).building ?? "",
      area: data.area,
      landmark: compact ? "" : (data as AddressFormSchema).landmark ?? "",
      city,
      state,
      country: data.country || "India",
      postalCode: data.postalCode,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      addressType: compact ? "home" : data.addressType,
      isDefault: data.isDefault ?? true,
    });
  });

  if (compact) {
    return (
      <form onSubmit={submitHandler} className="space-y-3">
        <div className="space-y-3 rounded-xl border border-stone-200/80 bg-stone-50/80 p-3 sm:p-4">
          <FloatingInput
            label="Your name"
            autoComplete="name"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <FloatingInput
            label="Mobile number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            error={errors.phoneNumber?.message}
            {...register("phoneNumber")}
          />
          <FloatingInput
            label="House / flat no."
            autoComplete="address-line1"
            error={errors.houseFlat?.message}
            {...register("houseFlat")}
          />
          <FloatingInput
            label="Street & area"
            autoComplete="address-line2"
            error={errors.area?.message}
            {...register("area")}
          />
          <FloatingInput
            label="Pincode"
            inputMode="numeric"
            maxLength={6}
            autoComplete="postal-code"
            error={errors.postalCode?.message}
            {...register("postalCode")}
          />
          <input type="hidden" {...register("city")} />
          <input type="hidden" {...register("state")} />
          <input type="hidden" {...register("country")} />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-urja-forest text-sm font-medium text-white disabled:opacity-60 sm:min-h-11"
        >
          {saving ? <UrjaLoader size="xs" srLabel="Saving address" /> : null}
          {submitLabel}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={submitHandler} className="space-y-4">
      <LocationButton onLocated={handleLocated} />

      <div className={cn("space-y-4", autofillPulse && "ring-2 ring-sky-200 rounded-2xl")}>
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
          <h3 className="text-urja-forest mb-3 text-xs font-bold tracking-wide uppercase">
            Contact details
          </h3>
          <div className="space-y-3">
            <FloatingInput
              label="Full name"
              error={errors.fullName?.message}
              {...register("fullName")}
            />
            <FloatingInput
              label="Phone number"
              type="tel"
              inputMode="numeric"
              error={errors.phoneNumber?.message}
              {...register("phoneNumber")}
            />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
          <h3 className="text-urja-forest mb-3 text-xs font-bold tracking-wide uppercase">
            Address details
          </h3>
          <div className="mb-4 flex gap-2">
            {TYPE_PILLS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setValue("addressType", t.id)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-2xl border py-2.5 text-xs font-bold transition",
                  addressType === t.id
                    ? "border-urja-gold bg-urja-gold text-urja-forest shadow-sm"
                    : "border-black/[0.06] bg-black/[0.02] text-urja-forest"
                )}
              >
                <span className="text-base">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            <FloatingInput
              label="House no. / flat"
              error={errors.houseFlat?.message}
              {...register("houseFlat")}
            />
            <FloatingInput
              label="Building / society"
              error={"building" in errors ? errors.building?.message : undefined}
              {...register("building")}
            />
            <FloatingInput
              label="Area / street"
              error={errors.area?.message}
              {...register("area")}
            />
            <FloatingInput
              label="Landmark (optional)"
              error={"landmark" in errors ? errors.landmark?.message : undefined}
              {...register("landmark")}
            />
          </div>
        </section>

        {showLocation ? (
          <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
            <h3 className="text-urja-forest mb-3 text-xs font-bold tracking-wide uppercase">
              Location
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FloatingInput label="City" error={errors.city?.message} {...register("city")} />
                <FloatingInput
                  label="State"
                  error={"state" in errors ? errors.state?.message : undefined}
                  {...register("state")}
                />
              </div>
              <FloatingInput
                label="Pincode"
                inputMode="numeric"
                maxLength={6}
                error={errors.postalCode?.message}
                {...register("postalCode")}
              />
            </div>
            <input type="hidden" {...register("country")} />
          </section>
        ) : (
          <button
            type="button"
            onClick={() => setShowLocation(true)}
            className="text-urja-forest flex w-full items-center justify-center gap-1 rounded-2xl border border-dashed border-urja-forest/25 bg-white py-3 text-sm font-semibold"
          >
            Add city &amp; pincode
          </button>
        )}
      </div>

      <div className="sticky bottom-24 z-30 flex gap-2 pt-2 sm:bottom-4">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-black/10 bg-white py-3.5 text-sm font-bold text-urja-forest"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          disabled={saving}
          className={cn(
            "bg-urja-gold text-urja-forest flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold shadow-lg transition disabled:opacity-60",
            onCancel ? "flex-[2]" : "w-full"
          )}
        >
          {saving ? <UrjaLoader size="xs" srLabel="Saving address" /> : null}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
