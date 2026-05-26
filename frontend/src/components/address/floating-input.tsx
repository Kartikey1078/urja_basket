"use client";

import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

type FloatingInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function FloatingInput({ label, error, className, id, ...props }: FloatingInputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="relative">
      <input
        id={inputId}
        placeholder=" "
        className={cn(
          "peer w-full rounded-2xl border bg-white px-4 pb-3 pt-6 text-[15px] outline-none transition-all",
          "placeholder:text-transparent",
          error
            ? "border-red-300 ring-2 ring-red-100 focus:border-red-400"
            : "border-black/[0.08] shadow-sm focus:border-urja-forest focus:ring-2 focus:ring-urja-forest/12",
          className
        )}
        {...props}
      />
      <label
        htmlFor={inputId}
        className={cn(
          "pointer-events-none absolute left-4 text-muted-foreground transition-all",
          "top-4 text-[15px] peer-focus:top-2 peer-focus:text-xs peer-focus:font-medium peer-focus:text-urja-forest",
          "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium"
        )}
      >
        {label}
      </label>
      <AnimatePresence>
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 px-1 text-xs text-red-500"
            role="alert"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
