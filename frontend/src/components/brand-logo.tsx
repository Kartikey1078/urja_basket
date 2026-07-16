import Link from "next/link";

import { cn } from "@/lib/utils";

export const BRAND_LOGO_SRC = "/brand/urja-basket-logo.svg";

const squareSizeClasses = {
  xs: "h-10 w-10",
  sm: "h-16 w-16",
  md: "h-20 w-20",
  lg: "h-24 w-24",
  xl: "h-32 w-32",
  "2xl": "h-40 w-40",
} as const;

const horizontalSizeClasses = {
  xs: "h-10 w-auto max-w-[9rem]",
  sm: "h-12 w-auto max-w-[10.5rem]",
  md: "h-14 w-auto max-w-[12rem]",
  lg: "h-16 w-auto max-w-[14rem]",
  xl: "h-20 w-auto max-w-[16rem]",
  "2xl": "h-24 w-auto max-w-[19rem]",
} as const;

type BrandLogoProps = {
  size?: keyof typeof squareSizeClasses;
  layout?: "square" | "horizontal";
  href?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  onClick?: () => void;
  /** Crops square asset padding so the mark reads larger (square layout only). */
  zoom?: boolean;
};

export function BrandLogo({
  size = "md",
  layout = "square",
  href = "/",
  className,
  imageClassName,
  priority,
  onClick,
  zoom = false,
}: BrandLogoProps) {
  const isHorizontal = layout === "horizontal";
  const sizeClass = isHorizontal ? horizontalSizeClasses[size] : squareSizeClasses[size];

  const image = (
    // eslint-disable-next-line @next/next/no-img-element -- static brand asset; avoids Next image config for local PNG
    <img
      src={BRAND_LOGO_SRC}
      alt="Urja Basket"
      width={isHorizontal ? 240 : 120}
      height={isHorizontal ? 100 : 120}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={cn(
        "shrink-0 object-contain",
        isHorizontal && "object-left",
        sizeClass,
        !isHorizontal && zoom && "scale-[1.45] origin-center",
        imageClassName
      )}
    />
  );

  const content =
    !isHorizontal && zoom ? (
      <span
        className={cn(
          "inline-flex items-center justify-center overflow-hidden",
          squareSizeClasses[size]
        )}
      >
        {image}
      </span>
    ) : (
      image
    );

  if (!href) {
    return <span className={cn("inline-flex", className)}>{content}</span>;
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("inline-flex shrink-0 select-none", className)}
    >
      {content}
    </Link>
  );
}
