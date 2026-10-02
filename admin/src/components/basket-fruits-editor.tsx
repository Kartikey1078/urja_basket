"use client";

import { Plus, X } from "lucide-react";

import { BASKET_FRUITS_MAX } from "@/lib/basket-fruits-constants";
import { cn } from "@/lib/cn";

type BasketFruitsEditorProps = {
  value: string[];
  onChange: (fruits: string[]) => void;
  className?: string;
};

export function BasketFruitsEditor({ value, onChange, className }: BasketFruitsEditorProps) {
  const canAdd = value.length < BASKET_FRUITS_MAX;

  const updateAt = (index: number, next: string) => {
    const copy = [...value];
    copy[index] = next;
    onChange(copy);
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const addRow = () => {
    if (!canAdd) return;
    onChange([...value, ""]);
  };

  return (
    <div className={cn("rounded-xl border border-amber-200/80 bg-amber-50/40 p-4", className)}>
      <p className="text-sm font-medium text-slate-900">Types of fruits</p>
      <p className="mt-0.5 text-xs text-slate-600">
        List what is included in this basket (up to {BASKET_FRUITS_MAX} names). Shown on the
        storefront as &ldquo;Fruits Included&rdquo;.
      </p>

      <ul className="mt-3 space-y-2">
        {value.map((fruit, index) => (
          <li key={index} className="flex gap-2">
            <input
              type="text"
              value={fruit}
              onChange={(e) => updateAt(index, e.target.value)}
              placeholder={`Fruit ${index + 1} — e.g. Alphonso Mango`}
              maxLength={80}
              className="block min-h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25"
            />
            <button
              type="button"
              onClick={() => removeAt(index)}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              aria-label={`Remove fruit ${index + 1}`}
            >
              <X className="size-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      {canAdd ? (
        <button
          type="button"
          onClick={addRow}
          className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-dashed border-emerald-300 bg-white px-3 text-sm font-medium text-emerald-900 hover:bg-emerald-50/80"
        >
          <Plus className="size-4" aria-hidden />
          Add fruit
        </button>
      ) : (
        <p className="mt-3 text-xs font-medium text-amber-900">
          Maximum of {BASKET_FRUITS_MAX} fruits reached.
        </p>
      )}
    </div>
  );
}
