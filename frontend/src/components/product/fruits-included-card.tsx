import { Apple } from "lucide-react";

import { cn } from "@/lib/utils";

type FruitsIncludedCardProps = {
  fruits: string[];
  className?: string;
};

export function FruitsIncludedCard({ fruits, className }: FruitsIncludedCardProps) {
  const items = fruits.map((f) => f.trim()).filter(Boolean);
  if (items.length === 0) return null;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-white via-[#fff9f2] to-amber-50/70",
        "ring-1 ring-amber-200/70",
        "shadow-[0_14px_40px_-22px_rgba(120,72,24,0.28)]",
        className
      )}
      aria-labelledby="fruits-included-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-400 via-urja-gold to-emerald-400"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-urja-gold/15 blur-2xl"
        aria-hidden
      />

      <div className="relative px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-emerald-50 text-amber-900 ring-1 ring-amber-200/80"
            aria-hidden
          >
            <Apple className="size-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="fruits-included-heading"
              className="text-urja-forest text-base font-bold tracking-tight sm:text-lg"
            >
              Fruits included
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
              Handpicked varieties in this basket
            </p>
          </div>
        </div>

        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {items.map((fruit, index) => (
            <li
              key={`${fruit}-${index}`}
              className="flex items-center gap-2.5 rounded-xl bg-white/90 px-3 py-2.5 text-sm font-medium text-urja-forest ring-1 ring-amber-100/90 sm:py-3"
            >
              <span
                className="size-1.5 shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-emerald-500"
                aria-hidden
              />
              <span className="min-w-0 leading-snug">{fruit}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
