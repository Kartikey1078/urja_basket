"use client";

import { cn } from "@/lib/utils";

type FloatingInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function FloatingInput({ label, error, className, id, ...props }: FloatingInputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="relative w-full min-w-0">
      <input
        id={inputId}
        placeholder=" "
        className={cn(
          "peer w-full min-h-12 rounded-xl border bg-white px-3 pb-2 pt-5 text-base outline-none transition sm:min-h-11 sm:text-sm",
          "placeholder:text-transparent",
          error
            ? "border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-200"
            : "border-stone-200 focus:border-urja-forest focus:ring-2 focus:ring-urja-forest/15",
          className
        )}
        {...props}
      />
      <label
        htmlFor={inputId}
        className={cn(
          "pointer-events-none absolute left-3 text-stone-500 transition-all",
          "top-3.5 text-base sm:top-3 sm:text-sm",
          "peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-urja-forest",
          "peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs"
        )}
      >
        {label}
      </label>
      {error ? (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
