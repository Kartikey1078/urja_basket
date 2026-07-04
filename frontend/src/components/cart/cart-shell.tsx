import { cn } from "@/lib/utils";

/** Shared surface styles for cart page sections */
export const cartCardClass =
  "overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/80";

export function CartSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(cartCardClass, className)}>
      {title ? (
        <div className="border-b border-stone-100 px-4 py-3 sm:px-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">{title}</h2>
        </div>
      ) : null}
      {children}
    </section>
  );
}
