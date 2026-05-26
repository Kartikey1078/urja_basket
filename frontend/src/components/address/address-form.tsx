"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { FloatingInput } from "@/components/address/floating-input";
import { LocationButton } from "@/components/address/location-button";
import { addressFormSchema, type AddressFormSchema } from "@/lib/address/validation";
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
  const defaults =
    initial == null
      ? emptyAddressForm()
      : "formatted" in initial
        ? addressToFormValues(initial)
        : initial;

  const [showLocation, setShowLocation] = useState(false);
  const [autofillPulse, setAutofillPulse] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormSchema>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: defaults,
  });

  const addressType = watch("addressType");
  const houseFlat = watch("houseFlat");
  const area = watch("area");

  useEffect(() => {
    setValue("country", "India");
  }, [setValue]);

  useEffect(() => {
    if (initial == null) return;
    const values = "formatted" in initial ? addressToFormValues(initial) : initial;
    Object.entries(values).forEach(([key, val]) => {
      setValue(key as keyof AddressFormSchema, val as never);
    });
    if (values.city || values.postalCode) setShowLocation(true);
  }, [initial, setValue]);

  useEffect(() => {
    if (houseFlat && area && !showLocation) {
      const t = setTimeout(() => setShowLocation(true), 400);
      return () => clearTimeout(t);
    }
  }, [houseFlat, area, showLocation]);

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

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSubmit({
          ...data,
          alternatePhone: data.alternatePhone ?? "",
          floor: data.floor ?? "",
          building: data.building ?? "",
          landmark: data.landmark ?? "",
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          isDefault: data.isDefault ?? true,
        })
      )}
      className="space-y-4"
    >
      <LocationButton onLocated={handleLocated} />

      <motion.div
        animate={autofillPulse ? { scale: [1, 1.01, 1] } : {}}
        className="space-y-4"
      >
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
              <motion.button
                key={t.id}
                type="button"
                layout
                onClick={() => setValue("addressType", t.id)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-2xl border py-2.5 text-xs font-bold transition",
                  addressType === t.id
                    ? "border-urja-forest bg-urja-forest text-urja-cream shadow-md"
                    : "border-black/[0.06] bg-black/[0.02] text-urja-forest"
                )}
              >
                <span className="text-base">{t.emoji}</span>
                {t.label}
              </motion.button>
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
              error={errors.building?.message}
              {...register("building")}
            />
            <FloatingInput
              label="Area / street"
              error={errors.area?.message}
              {...register("area")}
            />
            <FloatingInput
              label="Landmark (optional)"
              error={errors.landmark?.message}
              {...register("landmark")}
            />
          </div>
        </section>

        <AnimatePresence initial={false}>
          {showLocation ? (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]"
            >
              <h3 className="text-urja-forest mb-3 text-xs font-bold tracking-wide uppercase">
                Location
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput label="City" error={errors.city?.message} {...register("city")} />
                  <FloatingInput
                    label="State"
                    error={errors.state?.message}
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
            </motion.section>
          ) : (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowLocation(true)}
              className="text-urja-forest flex w-full items-center justify-center gap-1 rounded-2xl border border-dashed border-urja-forest/25 bg-white py-3 text-sm font-semibold"
            >
              Add city &amp; pincode
              <ChevronDown className="size-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <div
        className={cn(
          "flex gap-2",
          embedded
            ? "sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-20 -mx-1 bg-gradient-to-t from-urja-cream via-urja-cream to-transparent pt-3 pb-1"
            : "sticky bottom-24 z-30 pt-2 sm:bottom-4"
        )}
      >
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
            "bg-urja-forest text-urja-cream flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold shadow-lg transition disabled:opacity-60",
            onCancel ? "flex-[2]" : "w-full"
          )}
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
