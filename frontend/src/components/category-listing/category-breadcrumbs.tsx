import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type CategoryBreadcrumbsProps = {
  categoryLabel: string;
  className?: string;
};

export function CategoryBreadcrumbs({
  categoryLabel,
  className,
}: CategoryBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="text-muted-foreground flex flex-wrap items-center gap-1">
        <li className="flex min-w-0 items-center gap-1">
          <Link
            href="/"
            className="text-foreground hover:text-urja-forest inline-flex max-w-full min-w-0 items-center gap-1 font-medium transition"
          >
            <Home className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="truncate">Home</span>
          </Link>
        </li>
        <li className="flex items-center" aria-hidden>
          <ChevronRight className="size-4 shrink-0 opacity-60" />
        </li>
        <li
          className="text-foreground min-w-0 truncate font-medium"
          aria-current="page"
        >
          {categoryLabel}
        </li>
      </ol>
    </nav>
  );
}
