"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

import { AdminApiError, adminFetchJson } from "@/lib/api-client";
import type { NutritionTagCatalog } from "@/lib/types";
import { cn } from "@/lib/cn";

type NutritionTagsEditorProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  className?: string;
};

export function NutritionTagsEditor({ value, onChange, className }: NutritionTagsEditorProps) {
  const catalog = useQuery({
    queryKey: ["admin", "nutrition-tags"],
    queryFn: () =>
      adminFetchJson<{ data: NutritionTagCatalog[] }>("nutrition-tags").then((r) => r.data),
  });

  const toggle = (name: string) => {
    const exists = value.some((t) => t.toLowerCase() === name.toLowerCase());
    if (exists) {
      onChange(value.filter((t) => t.toLowerCase() !== name.toLowerCase()));
      return;
    }
    onChange([...value, name].sort((a, b) => a.localeCompare(b)));
  };

  return (
    <div className={className}>
      <p className="text-sm font-medium text-slate-700">Nutrition tags</p>
      <p className="mt-0.5 text-xs text-slate-500">
        Pick from the catalog — names must match entries in Nutrition tags admin.
      </p>

      {catalog.isError ? (
        <p className="mt-3 text-xs text-red-700">
          {catalog.error instanceof AdminApiError
            ? catalog.error.message
            : "Could not load nutrition catalog."}
        </p>
      ) : null}

      {catalog.isPending ? (
        <p className="mt-3 text-xs text-slate-500">Loading catalog…</p>
      ) : catalog.data && catalog.data.length > 0 ? (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {catalog.data.map((tag) => {
            const selected = value.some((t) => t.toLowerCase() === tag.name.toLowerCase());
            return (
              <li key={tag.id}>
                <button
                  type="button"
                  onClick={() => toggle(tag.name)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition",
                    selected
                      ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  )}
                  aria-pressed={selected}
                >
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
                    {tag.image_url ? (
                      <Image
                        src={tag.image_url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-[10px] text-slate-400">
                        —
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1 font-medium">{tag.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          No catalog tags yet. Create them under Nutrition tags in the admin menu.
        </p>
      )}

      {value.length > 0 ? (
        <p className="mt-3 text-xs font-medium text-emerald-800">
          Selected: {value.join(", ")}
        </p>
      ) : null}
    </div>
  );
}
