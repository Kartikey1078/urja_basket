import { cn } from "@/lib/utils";

type BestsellerBadgeProps = {
  className?: string;
  /** Smaller label for tight horizontal rails (e.g. home bestsellers). */
  compact?: boolean;
};

export function BestsellerBadge({ className, compact }: BestsellerBadgeProps) {
  return (
    <span
      className={cn(
        "bg-urja-forest inline-block rounded-md font-semibold tracking-wide text-white uppercase",
        compact
          ? "max-w-[7.5rem] truncate px-1.5 py-0.5 text-[7px] leading-none sm:max-w-none sm:text-[8px] md:text-[9px]"
          : "px-2 py-1 text-[10px] sm:text-xs",
        className
      )}
    >
      Bestseller
    </span>
  );
}
