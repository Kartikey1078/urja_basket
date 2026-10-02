"use client";

import {
  Award,
  Clock,
  Leaf,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";

import type { ProductDetail } from "@/lib/product-detail";
import { isFruitBasketCategory } from "@/lib/fruit-basket";
import { cn } from "@/lib/utils";

type ReviewSnippet = {
  id: number;
  rating: number;
  comment: string | null;
};

type ProductAboutSectionProps = {
  product: ProductDetail;
  variantCount: number;
  reviews?: ReviewSnippet[];
  className?: string;
};

const TRUST_POINTS = [
  { icon: Leaf, label: "Farm fresh", sub: "Handpicked quality" },
  { icon: ShieldCheck, label: "Hygienically packed", sub: "Safe & clean" },
  { icon: Truck, label: "Fast delivery", sub: "~30 mins in Delhi" },
  { icon: Clock, label: "Daily restocked", sub: "Always fresh stock" },
] as const;

export function ProductAboutSection({
  product,
  variantCount,
  reviews = [],
  className,
}: ProductAboutSectionProps) {
  const full = product.fullDescription?.trim() ?? "";
  const short = product.shortDescription?.trim() ?? "";
  const body = full || short;
  const showLead = Boolean(short && short !== full);

  if (!body && variantCount === 0) return null;

  const highlights = buildHighlights(product);
  const topReview = reviews.find((r) => r.comment?.trim());
  const showNutrition =
    !isFruitBasketCategory(product.category.slug) &&
    product.nutritionTags &&
    product.nutritionTags.length > 0;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[1.35rem]",
        "bg-gradient-to-br from-white via-[#f8fbf7] to-emerald-50/40",
        "ring-1 ring-urja-forest/10",
        "shadow-[0_12px_40px_-24px_rgba(11,43,30,0.18)]",
        className
      )}
      aria-labelledby="product-description-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-urja-forest via-emerald-500 to-urja-gold"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-urja-gold/10 blur-2xl"
        aria-hidden
      />

      <div className="relative px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start gap-3">
          <div
            className="bg-urja-forest/10 text-urja-forest flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-urja-forest/12"
            aria-hidden
          >
            <Sparkles className="size-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="product-description-heading"
              className="text-urja-forest text-lg font-bold tracking-tight sm:text-xl"
            >
              About this product
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
              Everything you need to know before you order
            </p>
          </div>
        </div>

        {highlights.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {highlights.map((item) => (
              <li
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-urja-forest shadow-sm ring-1 ring-urja-forest/10 sm:text-xs"
              >
                <span className="bg-urja-forest/10 flex size-4 items-center justify-center rounded-full">
                  <Award className="size-2.5" aria-hidden />
                </span>
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        {body ? (
          <div className="mt-5 space-y-3">
            {showLead ? (
              <p className="text-foreground text-[0.9375rem] leading-7 font-medium sm:text-base sm:leading-8">
                {short}
              </p>
            ) : null}
            <p
              className={cn(
                "text-foreground/80 whitespace-pre-line",
                showLead
                  ? "text-sm leading-7 sm:text-[0.9375rem] sm:leading-8"
                  : "text-[0.9375rem] leading-7 sm:text-base sm:leading-8"
              )}
            >
              {showLead ? full : body}
            </p>
          </div>
        ) : null}

        {showNutrition ? (
          <div className="mt-5">
            <p className="text-urja-forest/70 text-[11px] font-bold tracking-wide uppercase">
              Nutrition highlights
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {product.nutritionTags!.map((tag) => (
                <li
                  key={tag}
                  className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-3">
          {TRUST_POINTS.map(({ icon: Icon, label, sub }) => (
            <li
              key={label}
              className="flex items-start gap-2.5 rounded-xl bg-white/80 px-3 py-3 ring-1 ring-urja-forest/8 sm:px-3.5 sm:py-3.5"
            >
              <span className="bg-gradient-to-br from-urja-forest/12 to-emerald-100/80 text-urja-forest flex size-8 shrink-0 items-center justify-center rounded-lg">
                <Icon className="size-4" strokeWidth={2} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-bold text-urja-forest sm:text-[0.8125rem]">
                  {label}
                </span>
                <span className="text-muted-foreground mt-0.5 block text-[10px] leading-snug sm:text-[11px]">
                  {sub}
                </span>
              </span>
            </li>
          ))}
        </ul>

        {topReview ? (
          <blockquote className="mt-5 rounded-xl border-l-4 border-urja-gold/70 bg-white/70 px-4 py-3.5 ring-1 ring-urja-forest/6">
            <div className="flex items-center gap-1" aria-hidden>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-3.5",
                    i < topReview.rating
                      ? "fill-amber-400 text-amber-400"
                      : "fill-neutral-200 text-neutral-200"
                  )}
                  strokeWidth={0}
                />
              ))}
            </div>
            <p className="text-foreground/85 mt-2 text-sm leading-relaxed italic">
              &ldquo;{topReview.comment}&rdquo;
            </p>
          </blockquote>
        ) : null}
      </div>
    </section>
  );
}

function buildHighlights(product: ProductDetail): string[] {
  const items: string[] = [];
  if (product.isBestSeller) items.push("Bestseller");
  if (product.isOrganic) items.push("Organic");
  if (product.averageRating >= 4) {
    items.push(`${product.averageRating.toFixed(1)}★ rated`);
  }
  return items;
}
