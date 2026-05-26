"use client";

import { Loader2, MapPin, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

import { reverseGeocode } from "@/lib/address/geocode";
import { cn } from "@/lib/utils";

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
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={loading}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border border-urja-forest/15 bg-gradient-to-r from-urja-forest/[0.06] to-white p-4 text-left shadow-sm transition disabled:opacity-70",
        className
      )}
    >
      <span className="bg-urja-forest text-urja-cream flex size-11 shrink-0 items-center justify-center rounded-xl shadow-md">
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Navigation className="size-5" strokeWidth={2.25} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-urja-forest flex items-center gap-1.5 text-sm font-bold">
          <MapPin className="size-4" />
          Use current location
        </span>
        <span className="text-muted-foreground mt-0.5 block text-xs">
          Get address automatically
        </span>
      </span>
    </motion.button>
  );
}
