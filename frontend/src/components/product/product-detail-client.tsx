"use client";

import { ChevronRight, Leaf, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { QuantityButton } from "@/components/cart/quantity-button";
import { BestsellerBadge } from "@/components/category-listing/bestseller-badge";
import { FruitsIncludedCard } from "@/components/product/fruits-included-card";
import { ProductAboutSection } from "@/components/product/product-about-section";
import { isFruitBasketCategory } from "@/lib/fruit-basket";
import { ProductImageGallery } from "@/components/product/product-image-gallery";
import { useCart } from "@/hooks/use-cart";
import { useProductGalleryScrollOverlay } from "@/hooks/use-product-gallery-scroll-overlay";
import type { CartProductInput } from "@/lib/cart/types";
import type { ProductDetailResponse, ProductVariant } from "@/lib/product-detail";
import { cn } from "@/lib/utils";

const FALLBACK_IMAGE = "/image.png";

function formatInr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

type Props = {
  initial: ProductDetailResponse;
};

export function ProductDetailClient({ initial }: Props) {
  const router = useRouter();
  const { addItem, authReady } = useCart();
  const [data, setData] = useState(initial);
  const variants = data.variants.filter((v) => v.inStock && v.stock > 0);
  const [selectedSku, setSelectedSku] = useState(variants[0]?.sku ?? "");
  const [buying, setBuying] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const scrollOverlayOpacity = useProductGalleryScrollOverlay(sectionRef, galleryRef);

  const selected = useMemo(
    () => variants.find((v) => v.sku === selectedSku) ?? variants[0] ?? null,
    [variants, selectedSku]
  );

  const refreshStock = useCallback(async () => {
    try {
      const res = await fetch(`/api/product-detail?slug=${encodeURIComponent(data.product.slug)}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const body = (await res.json()) as ProductDetailResponse;
      setData(body);
    } catch {
      /* ignore */
    }
  }, [data.product.slug]);

  useEffect(() => {
    const onFocus = () => void refreshStock();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshStock]);

  useEffect(() => {
    if (variants.length === 0) {
      setSelectedSku("");
      return;
    }
    if (!variants.some((v) => v.sku === selectedSku)) {
      setSelectedSku(variants[0].sku);
    }
  }, [variants, selectedSku]);

  const product = data.product;
  const image = (product.image ?? product.mainImage ?? "").trim() || FALLBACK_IMAGE;
  const galleryImages = useMemo(() => {
    const urls = [product.mainImage, product.image]
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value));
    const unique = [...new Set(urls)];
    return unique.length > 0 ? unique : [FALLBACK_IMAGE];
  }, [product.image, product.mainImage]);

  const mrp = selected
    ? Math.max(selected.originalPrice ?? selected.price, selected.price)
    : 0;
  const price = selected?.price ?? 0;
  const off =
    mrp > price ? Math.round((1 - price / mrp) * 100) : 0;

  const cartProduct: CartProductInput | null = selected
    ? {
        slug: product.slug,
        name: product.name,
        weight: selected.weight,
        price: selected.price,
        mrp,
        image,
        variantSku: selected.sku,
        tag: product.isBestSeller ? "Bestseller" : undefined,
        productId: product.id,
      }
    : null;

  const isOutOfStock = !product.inStock || variants.length === 0;
  const isFruitBasket = isFruitBasketCategory(product.category.slug);
  const basketFruits = isFruitBasket ? (product.basketFruits ?? []) : [];

  const handleBuyNow = async () => {
    if (!cartProduct || !authReady || buying) return;
    setBuying(true);
    try {
      await addItem(cartProduct, 1);
      router.push("/checkout");
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-emerald-50/70 via-urja-cream to-white text-urja-forest min-w-0 pb-8 sm:pb-12 lg:pb-16">
      <div className="mx-auto w-full max-w-7xl">
        <nav className="text-muted-foreground hidden flex-wrap items-center gap-1.5 px-4 pt-5 text-xs sm:flex sm:px-6 sm:pt-7 sm:text-sm lg:px-10">
          <Link href="/" className="hover:text-urja-forest transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3.5 opacity-60" aria-hidden />
          <Link
            href={`/categories/${product.category.slug}`}
            className="hover:text-urja-forest transition-colors"
          >
            {product.category.name}
          </Link>
          <ChevronRight className="size-3.5 opacity-60" aria-hidden />
          <span className="text-foreground line-clamp-1 font-medium">{product.name}</span>
        </nav>

        <div
          ref={sectionRef}
          className="relative mt-0 lg:mt-4 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-10 lg:px-10 lg:pb-10"
        >
          <div ref={galleryRef} className="sticky top-0 z-0 lg:top-24 lg:self-start">
            <ProductImageGallery
              images={galleryImages}
              alt={product.name}
              scrollOverlayOpacity={scrollOverlayOpacity}
              outOfStock={isOutOfStock}
              badge={
                product.isBestSeller ? (
                  <BestsellerBadge />
                ) : product.isOrganic ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold tracking-wide text-emerald-800 uppercase shadow-md ring-1 ring-emerald-200/80">
                    <Leaf className="size-3.5" aria-hidden />
                    Organic
                  </span>
                ) : null
              }
              className="lg:overflow-hidden lg:rounded-[1.75rem] lg:ring-1 lg:ring-urja-forest/8 lg:shadow-[0_20px_60px_-24px_rgba(11,43,30,0.22)]"
            />
          </div>

          <div className="relative z-10 -mt-14 rounded-t-[1.75rem] bg-white px-5 pt-5 pb-6 shadow-[0_-16px_40px_-12px_rgba(11,43,30,0.22)] ring-1 ring-urja-forest/6 sm:-mt-16 sm:px-6 sm:pt-6 sm:pb-8 lg:mt-0 lg:rounded-[1.75rem] lg:px-8 lg:py-8 lg:shadow-[0_16px_48px_-28px_rgba(11,43,30,0.2)]">
            <div
              className="mx-auto mb-5 h-1 w-10 rounded-full bg-neutral-200/90 lg:hidden"
              aria-hidden
            />
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/categories/${product.category.slug}`}
                className="bg-urja-forest/8 text-urja-forest hover:bg-urja-forest/12 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase transition-colors"
              >
                {product.category.name}
              </Link>
              {off > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#ecf6e8] px-3 py-1 text-[11px] font-bold text-[#3d6b2f] ring-1 ring-[#c8e4bc]">
                  <Sparkles className="size-3" aria-hidden />
                  {off}% off
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-balance sm:text-3xl lg:text-[2rem] lg:leading-tight">
              {product.name}
            </h1>

            {product.shortDescription ? (
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed sm:text-base">
                {product.shortDescription}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1" aria-hidden>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "size-4 sm:size-[1.125rem]",
                      i < Math.round(product.averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-neutral-200 text-neutral-200"
                    )}
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span className="text-muted-foreground text-sm font-medium">
                {product.averageRating.toFixed(1)} · {product.totalReviews.toLocaleString("en-IN")} reviews
              </span>
            </div>

            {selected ? (
              <div className="mt-6 rounded-2xl bg-gradient-to-r from-urja-forest/[0.06] via-emerald-50/80 to-urja-gold/10 px-4 py-4 ring-1 ring-urja-forest/10 sm:px-5 sm:py-5">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Price · {selected.weight}
                </p>
                <div className="mt-1.5 flex flex-wrap items-end gap-x-3 gap-y-1">
                  <span className="text-3xl font-bold tracking-tight sm:text-4xl">{formatInr(price)}</span>
                  {mrp > price ? (
                    <span className="text-muted-foreground pb-1 text-base line-through sm:text-lg">
                      {formatInr(mrp)}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              {variants.length > 0 ? (
                <VariantSection
                  variants={variants}
                  selectedSku={selected?.sku}
                  onSelect={setSelectedSku}
                />
              ) : (
                <OutOfStockBanner />
              )}
            </div>

            {basketFruits.length > 0 ? (
              <FruitsIncludedCard fruits={basketFruits} className="mt-7" />
            ) : null}

            {cartProduct ? (
              <ProductActionBar
                cartProduct={cartProduct}
                buying={buying}
                authReady={authReady}
                onBuyNow={() => void handleBuyNow()}
                className="mt-7 lg:mt-8"
              />
            ) : null}

            <ProductAboutSection
              product={product}
              variantCount={variants.length}
              reviews={data.reviews}
              className="mt-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductActionBar({
  cartProduct,
  buying,
  authReady,
  onBuyNow,
  className,
}: {
  cartProduct: CartProductInput;
  buying: boolean;
  authReady: boolean;
  onBuyNow: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4", className)}>
      <QuantityButton
        product={cartProduct}
        inStock
        className="w-full sm:max-w-[15rem]"
      />
      <button
        type="button"
        onClick={onBuyNow}
        disabled={!authReady || buying}
        className={cn(
          "inline-flex h-12 min-h-12 w-full flex-1 items-center justify-center rounded-2xl px-6 text-sm font-bold tracking-wide uppercase transition-all",
          "bg-gradient-to-r from-urja-gold via-[#d4c56e] to-urja-gold text-urja-forest",
          "shadow-[0_6px_20px_-6px_rgba(196,181,99,0.65)] ring-1 ring-urja-gold/40",
          "hover:brightness-105 hover:shadow-[0_8px_24px_-6px_rgba(196,181,99,0.75)]",
          "active:scale-[0.99] disabled:opacity-50 sm:max-w-[15rem]"
        )}
      >
        {buying ? "Please wait…" : "Buy now"}
      </button>
    </div>
  );
}

function OutOfStockBanner() {
  return (
    <p className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-4 text-center text-sm font-semibold text-neutral-600">
      Out of Stock
    </p>
  );
}

function VariantSection({
  variants,
  selectedSku,
  onSelect,
}: {
  variants: ProductVariant[];
  selectedSku?: string;
  onSelect: (sku: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-bold tracking-wide text-urja-forest uppercase">Select weight</p>
      <ul className="scroll-x-rail mt-3 flex gap-2.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        {variants.map((variant) => (
          <VariantChip
            key={variant.sku}
            variant={variant}
            selected={selectedSku === variant.sku}
            onSelect={() => onSelect(variant.sku)}
          />
        ))}
      </ul>
    </div>
  );
}

function VariantChip({
  variant,
  selected,
  onSelect,
}: {
  variant: ProductVariant;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li className="shrink-0 sm:shrink">
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "min-w-[5.5rem] rounded-2xl border px-4 py-3 text-left transition-all duration-200",
          selected
            ? "border-urja-forest bg-urja-forest text-urja-cream shadow-[0_8px_24px_-12px_rgba(11,43,30,0.45)] ring-2 ring-urja-gold/35"
            : "border-neutral-200/90 bg-white text-neutral-800 shadow-sm hover:border-urja-forest/35 hover:shadow-md"
        )}
      >
        <span className="block text-sm font-bold">{variant.weight}</span>
        <span
          className={cn(
            "mt-0.5 block text-xs font-medium",
            selected ? "text-urja-cream/85" : "text-muted-foreground"
          )}
        >
          {formatInr(variant.price)}
        </span>
      </button>
    </li>
  );
}
