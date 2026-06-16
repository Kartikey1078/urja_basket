import { cn } from "@/lib/utils";

type UrjaLoaderProps = {
  size?: "xs" | "sm" | "md" | "lg";
  label?: string;
  className?: string;
  /** For dark backgrounds (e.g. forest header) */
  variant?: "default" | "light";
  /** Screen reader text when no visible label */
  srLabel?: string;
};

const sizeMap = {
  xs: "size-3.5",
  sm: "size-4",
  md: "size-8",
  lg: "size-11",
} as const;

export function UrjaLoader({
  size = "md",
  label,
  className,
  variant = "default",
  srLabel = "Loading",
}: UrjaLoaderProps) {
  return (
    <span
      className={cn("inline-flex flex-col items-center gap-2.5", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span
        className={cn(
          "urja-loader relative inline-block shrink-0",
          variant === "light" && "urja-loader-light",
          sizeMap[size]
        )}
        aria-hidden
      />
      {label ? (
        <span className="text-urja-forest/75 text-xs font-semibold tracking-wide sm:text-sm">
          {label}
        </span>
      ) : (
        <span className="sr-only">{srLabel}</span>
      )}
    </span>
  );
}

type UrjaPageLoaderProps = {
  label?: string;
  className?: string;
};

export function UrjaPageLoader({
  label = "Loading…",
  className,
}: UrjaPageLoaderProps) {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center px-4 py-16",
        className
      )}
    >
      <UrjaLoader size="lg" label={label} />
    </div>
  );
}

type UrjaOverlayLoaderProps = {
  label?: string;
  className?: string;
};

export function UrjaOverlayLoader({
  label = "Updating…",
  className,
}: UrjaOverlayLoaderProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-urja-cream/55 backdrop-blur-[2px]",
        className
      )}
      aria-live="polite"
      aria-busy="true"
    >
      <span className="bg-urja-forest/8 text-urja-forest inline-flex items-center gap-2.5 rounded-full border border-urja-forest/10 px-4 py-2.5 text-sm font-semibold shadow-sm">
        <UrjaLoader size="sm" srLabel={label} />
        {label}
      </span>
    </div>
  );
}
