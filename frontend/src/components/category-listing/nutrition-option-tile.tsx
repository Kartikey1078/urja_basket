"use client";

import Image from "next/image";

import {
  NUTRITION_FALLBACK_IMAGE,
  type NutritionTagOption,
} from "@/lib/nutrition-filter-types";
import { getNutritionTagIcon } from "@/lib/nutrition-tag-icons";
import { cn } from "@/lib/utils";

type NutritionOptionTileProps = {
  option: NutritionTagOption;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
};

export function NutritionOptionTile({
  option,
  selected,
  onSelect,
  disabled = false,
}: NutritionOptionTileProps) {
  const Icon = getNutritionTagIcon(option.name);
  const imageSrc = option.imageUrl?.trim() || NUTRITION_FALLBACK_IMAGE;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Filter by ${option.name}`}
      className="group flex w-[3.75rem] shrink-0 snap-start flex-col items-center gap-1.5 transition disabled:opacity-50 sm:w-[4.25rem] sm:gap-2 md:w-[4.75rem]"
    >
      <span
        className={cn(
          "relative size-11 overflow-hidden rounded-full transition-all duration-200 sm:size-12 md:size-[3.35rem]",
          selected
            ? "bg-emerald-50 ring-2 ring-emerald-600 ring-offset-2 ring-offset-neutral-50/90"
            : "bg-white ring-1 ring-emerald-200/90 group-hover:ring-emerald-400/70"
        )}
      >
        {option.imageUrl ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            className={cn("object-cover transition-opacity", !selected && "opacity-95")}
            sizes="(max-width: 640px) 44px, 54px"
          />
        ) : (
          <span
            className={cn(
              "flex size-full items-center justify-center transition-colors",
              selected ? "bg-emerald-100 text-emerald-700" : "bg-emerald-50 text-emerald-600/80"
            )}
          >
            <Icon className="size-4 sm:size-5" strokeWidth={2} aria-hidden />
          </span>
        )}
        {selected ? (
          <span className="pointer-events-none absolute inset-0 rounded-full bg-emerald-600/10" aria-hidden />
        ) : null}
      </span>
      <span
        className={cn(
          "w-full truncate text-center text-[10px] leading-tight transition-colors sm:text-[11px]",
          selected ? "font-semibold text-emerald-800" : "font-medium text-emerald-900/45"
        )}
      >
        {option.name}
      </span>
      <span
        className={cn(
          "h-0.5 rounded-full bg-emerald-600 transition-all duration-200",
          selected ? "w-4 opacity-100" : "w-0 opacity-0"
        )}
        aria-hidden
      />
    </button>
  );
}
