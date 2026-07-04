"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useEffect } from "react";

import { cn } from "@/lib/cn";
import { useToastStore, type Toast, type ToastType } from "@/stores/toast-store";

const AUTO_DISMISS_MS = 4500;

const styles: Record<ToastType, { wrap: string; icon: string }> = {
  success: {
    wrap: "border-emerald-200 bg-emerald-50 text-emerald-950 shadow-emerald-900/10",
    icon: "text-emerald-600",
  },
  error: {
    wrap: "border-red-200 bg-red-50 text-red-950 shadow-red-900/10",
    icon: "text-red-600",
  },
  info: {
    wrap: "border-sky-200 bg-sky-50 text-sky-950 shadow-sky-900/10",
    icon: "text-sky-600",
  },
};

function ToastIcon({ type }: { type: ToastType }) {
  const className = cn("size-5 shrink-0", styles[type].icon);
  if (type === "success") return <CheckCircle2 className={className} aria-hidden />;
  if (type === "error") return <XCircle className={className} aria-hidden />;
  return <Info className={className} aria-hidden />;
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [dismiss, toast.id]);

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ring-1 ring-black/5",
        styles[toast.type].wrap
      )}
    >
      <ToastIcon type={toast.type} />
      <p className="min-w-0 flex-1 pt-0.5 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        className="shrink-0 rounded-md p-0.5 opacity-70 transition hover:opacity-100"
        aria-label="Dismiss notification"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export function AdminToastViewport() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
