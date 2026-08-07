import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailClient } from "@/components/product/product-detail-client";
import { JsonLd } from "@/components/seo/json-ld";
import { fetchProductDetail } from "@/lib/product-detail";
import { breadcrumbJsonLd, createPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchProductDetail(slug);
  if (!data) {
    return createPageMetadata({ title: "Product", path: `/products/${slug}` });
  }
  return createPageMetadata({
    title: data.product.name,
    description:
      data.product.shortDescription ??
      `Buy ${data.product.name} online at Urja Basket with fast delivery in Delhi.`,
    path: `/products/${slug}`,
    ogImage: data.product.mainImage ?? undefined,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const data = await fetchProductDetail(slug);
  if (!data) notFound();

  const { product } = data;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: product.category.name, path: `/categories/${product.category.slug}` },
          { name: product.name, path: `/products/${slug}` },
        ])}
      />
      <ProductDetailClient initial={data} />
    </>
  );
}
