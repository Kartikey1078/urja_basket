export function cartLineKey(slug: string, variantSku?: string): string {
  const sku = variantSku?.trim();
  return sku ? `${slug}::${sku}` : slug;
}

export function parseCartLineKey(id: string): { slug: string; variantSku?: string } {
  const idx = id.indexOf("::");
  if (idx === -1) return { slug: id };
  return { slug: id.slice(0, idx), variantSku: id.slice(idx + 2) };
}
