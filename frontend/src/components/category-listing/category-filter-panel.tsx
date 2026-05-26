"use client";

import type { PriceBounds, ProductFilters } from "@/lib/category-filters";
import { cn } from "@/lib/utils";

const RATING_OPTIONS = [
  { value: 4, label: "4★ & above" },
  { value: 3, label: "3★ & above" },
  { value: 2, label: "2★ & above" },
] as const;

type CategoryFilterPanelProps = {
  draft: ProductFilters;
  onDraftChange: (next: ProductFilters) => void;
  priceBounds: PriceBounds;
  className?: string;
};

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-neutral-100 px-4 py-4 last:border-b-0">
      <h3 className="mb-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function FilterCheckbox({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl px-1 py-2 transition-colors hover:bg-neutral-50">
      <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer size-5 cursor-pointer appearance-none rounded-md border-2 border-neutral-300 bg-white transition checked:border-emerald-700 checked:bg-emerald-700"
        />
        <svg
          className="pointer-events-none absolute size-3 text-white opacity-0 peer-checked:opacity-100"
          viewBox="0 0 12 10"
          fill="none"
          aria-hidden
        >
          <path
            d="M1 5.5L4.5 9L11 1.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-neutral-900">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-neutral-500">{description}</span>
        ) : null}
      </span>
    </label>
  );
}

function PriceRangeSection({
  bounds,
  draft,
  onDraftChange,
}: {
  bounds: PriceBounds;
  draft: ProductFilters;
  onDraftChange: (next: ProductFilters) => void;
}) {
  const lo = draft.minPrice ?? bounds.min;
  const hi = draft.maxPrice ?? bounds.max;
  const span = Math.max(bounds.max - bounds.min, 1);

  const setLo = (v: number) => {
    const clamped = Math.min(Math.max(v, bounds.min), hi);
    onDraftChange({ ...draft, minPrice: clamped <= bounds.min ? undefined : clamped });
  };

  const setHi = (v: number) => {
    const clamped = Math.max(Math.min(v, bounds.max), lo);
    onDraftChange({ ...draft, maxPrice: clamped >= bounds.max ? undefined : clamped });
  };

  const loPct = ((lo - bounds.min) / span) * 100;
  const hiPct = ((hi - bounds.min) / span) * 100;

  return (
    <FilterSection title="Price">
      <div className="mb-4 flex items-center justify-between text-sm font-semibold text-neutral-900">
        <span>₹{lo.toLocaleString("en-IN")}</span>
        <span className="text-neutral-400">—</span>
        <span>₹{hi.toLocaleString("en-IN")}</span>
      </div>

      <div className="relative mb-5 h-2 rounded-full bg-neutral-200">
        <div
          className="absolute h-full rounded-full bg-emerald-600"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={1}
          value={lo}
          onChange={(e) => setLo(Number(e.target.value))}
          className="pointer-events-none absolute inset-0 z-20 h-2 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-emerald-700 [&::-webkit-slider-thumb]:shadow-md"
          aria-label="Minimum price"
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={1}
          value={hi}
          onChange={(e) => setHi(Number(e.target.value))}
          className="pointer-events-none absolute inset-0 z-30 h-2 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-emerald-700 [&::-webkit-slider-thumb]:shadow-md"
          aria-label="Maximum price"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs font-medium text-neutral-600">
          Min (₹)
          <input
            type="number"
            min={bounds.min}
            max={hi}
            value={lo}
            onChange={(e) => setLo(Number(e.target.value))}
            className="mt-1 block w-full min-h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
        </label>
        <label className="block text-xs font-medium text-neutral-600">
          Max (₹)
          <input
            type="number"
            min={lo}
            max={bounds.max}
            value={hi}
            onChange={(e) => setHi(Number(e.target.value))}
            className="mt-1 block w-full min-h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
        </label>
      </div>
    </FilterSection>
  );
}

export function CategoryFilterPanel({
  draft,
  onDraftChange,
  priceBounds,
  className,
}: CategoryFilterPanelProps) {
  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain", className)}>
      <PriceRangeSection bounds={priceBounds} draft={draft} onDraftChange={onDraftChange} />

      <FilterSection title="Rating">
        <ul className="space-y-0.5">
          {RATING_OPTIONS.map((opt) => {
            const selected = draft.minRating === opt.value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left text-sm transition-colors",
                    selected
                      ? "bg-emerald-50 font-medium text-emerald-950"
                      : "text-neutral-800 hover:bg-neutral-50"
                  )}
                  onClick={() =>
                    onDraftChange({
                      ...draft,
                      minRating: selected ? undefined : opt.value,
                    })
                  }
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                      selected ? "border-emerald-700 bg-emerald-700" : "border-neutral-300 bg-white"
                    )}
                    aria-hidden
                  >
                    {selected ? <span className="size-2 rounded-full bg-white" /> : null}
                  </span>
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      </FilterSection>

      <FilterSection title="Offers">
        <FilterCheckbox
          checked={Boolean(draft.onSale)}
          onChange={(onSale) => onDraftChange({ ...draft, onSale: onSale || undefined })}
          label="On sale"
          description="Products with a discount"
        />
        <FilterCheckbox
          checked={Boolean(draft.featured)}
          onChange={(featured) => onDraftChange({ ...draft, featured: featured || undefined })}
          label="Featured"
        />
      </FilterSection>

      <FilterSection title="More filters">
        <FilterCheckbox
          checked={Boolean(draft.organic)}
          onChange={(organic) => onDraftChange({ ...draft, organic: organic || undefined })}
          label="Organic"
        />
        <FilterCheckbox
          checked={Boolean(draft.inStock)}
          onChange={(inStock) => onDraftChange({ ...draft, inStock: inStock || undefined })}
          label="In stock only"
          description="Hide out-of-stock items"
        />
      </FilterSection>
    </div>
  );
}

export function CategoryFilterFooter({
  onClear,
  onApply,
  activeCount,
}: {
  onClear: () => void;
  onApply: () => void;
  activeCount: number;
}) {
  return (
    <div className="flex shrink-0 gap-3 border-t border-neutral-200 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={onClear}
        className="min-h-11 flex-1 rounded-xl border border-neutral-300 bg-white text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
      >
        Clear{activeCount > 0 ? ` (${activeCount})` : ""}
      </button>
      <button
        type="button"
        onClick={onApply}
        className="min-h-11 flex-1 rounded-xl bg-emerald-700 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
      >
        Apply
      </button>
    </div>
  );
}
