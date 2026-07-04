"use client";

import { MapPin, Navigation } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { reverseGeocode } from "@/lib/address/geocode";
import { cn } from "@/lib/utils";
import { UrjaLoader } from "@/components/ui/loader";

type LocationButtonProps = {
  onLocated: (coords: {
    latitude: number;
    longitude: number;
    area?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    landmark?: string;
  }) => void;
  className?: string;
};

export function LocationButton({ onLocated, className }: LocationButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (!navigator.geolocation) {
      toast.error("Location is not supported on this device");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const geo = await reverseGeocode(latitude, longitude);
        onLocated({
          latitude,
          longitude,
          area: geo?.area,
          city: geo?.city,
          state: geo?.state,
          postalCode: geo?.postalCode,
          country: geo?.country,
          landmark: geo?.landmark,
        });
        if (geo) {
          toast.success("Address autofilled from your location");
        } else {
          toast.message("Location captured", {
            description: "Add pincode manually if needed.",
          });
        }
        setLoading(false);
      },
      () => {
        toast.error("Location permission denied", {
          description: "Enter your address manually below.",
        });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "flex min-h-12 w-full items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-left transition hover:bg-neutral-50 disabled:opacity-70 sm:min-h-11",
        className
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-600">
        {loading ? (
          <UrjaLoader size="sm" srLabel="Detecting location" />
        ) : (
          <Navigation className="size-4" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-800">
          <MapPin className="size-3.5 text-neutral-400" />
          Use current location
        </span>
        <span className="mt-0.5 block text-xs text-neutral-500">Auto-fill city & pincode</span>
      </span>
    </button>
  );
}
