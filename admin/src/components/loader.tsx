import { cn } from "@/lib/cn";

type AdminSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-8 border-[3px]",
} as const;

export function AdminSpinner({ size = "md", className }: AdminSpinnerProps) {
  return (
    <span
      className={cn(
        "inline-block shrink-0 animate-spin rounded-full border-slate-200 border-t-emerald-600",
        sizeMap[size],
        className
      )}
      role="status"
      aria-hidden
    />
  );
}

type AdminPageLoaderProps = {
  label?: string;
  className?: string;
};

export function AdminPageLoader({
  label = "Loading…",
  className,
}: AdminPageLoaderProps) {
  return (
    <div
      className={cn("flex items-center justify-center gap-2.5 py-16 text-sm text-slate-500", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <AdminSpinner size="md" />
      <span>{label}</span>
    </div>
  );
}

type AdminTableLoaderProps = {
  colSpan: number;
  label?: string;
};

export function AdminTableLoader({ colSpan, label = "Loading…" }: AdminTableLoaderProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10">
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <AdminSpinner size="sm" />
          <span>{label}</span>
        </div>
      </td>
    </tr>
  );
}

type AdminInlineLoaderProps = {
  label?: string;
  className?: string;
};

export function AdminInlineLoader({ label, className }: AdminInlineLoaderProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-sm text-slate-500", className)}
      role="status"
      aria-live="polite"
    >
      <AdminSpinner size="sm" />
      {label ? <span>{label}</span> : null}
    </span>
  );
}
