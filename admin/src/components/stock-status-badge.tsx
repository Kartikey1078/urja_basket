import { cn } from "@/lib/cn";
import type { StockStatus } from "@/lib/types";

const styles: Record<StockStatus, string> = {
  in_stock: "bg-emerald-50 text-emerald-900 border-emerald-200",
  low_stock: "bg-amber-50 text-amber-900 border-amber-200",
  out_of_stock: "bg-red-50 text-red-900 border-red-200",
};

const labels: Record<StockStatus, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
};

export function StockStatusBadge({ status }: { status: StockStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}
