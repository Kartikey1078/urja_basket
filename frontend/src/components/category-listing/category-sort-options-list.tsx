import {
  CATEGORY_SORT_OPTIONS,
  type ProductSortValue,
} from "@/lib/category-sort";
import { cn } from "@/lib/utils";

type CategorySortOptionsListProps = {
  value: ProductSortValue | null;
  onSelect: (sort: ProductSortValue) => void;
  /** Slightly roomier tap targets on mobile sheet */
  variant?: "sheet" | "popover";
};

export function CategorySortOptionsList({
  value,
  onSelect,
  variant = "sheet",
}: CategorySortOptionsListProps) {
  const isPopover = variant === "popover";

  return (
    <ul className={cn(isPopover ? "p-1.5" : "px-2 py-2")} role="listbox" aria-label="Sort options">
      {CATEGORY_SORT_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <li key={option.value} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={selected}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl text-left transition-colors",
                isPopover ? "px-3 py-2.5 text-sm" : "px-3 py-3.5 text-[15px]",
                selected
                  ? "bg-emerald-50 font-medium text-emerald-950"
                  : "text-neutral-800 hover:bg-neutral-50 active:bg-neutral-100"
              )}
              onClick={() => onSelect(option.value)}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  selected ? "border-emerald-700 bg-emerald-700" : "border-neutral-300 bg-white"
                )}
                aria-hidden
              >
                {selected ? <span className="size-2 rounded-full bg-white" /> : null}
              </span>
              <span className="flex-1">{option.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
