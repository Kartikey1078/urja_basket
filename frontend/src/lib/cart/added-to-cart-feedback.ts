import { toast } from "sonner";

import type { CartProductInput } from "@/lib/cart/types";

type AddedToCartToastOptions = {
  product: CartProductInput;
  quantity?: number;
  onViewCart: () => void;
};

export function showAddedToCartToast({
  product,
  quantity = 1,
  onViewCart,
}: AddedToCartToastOptions) {
  toast.success(quantity > 1 ? `${quantity} added to cart` : "Added to cart", {
    description: product.name,
    duration: 4500,
    action: {
      label: "View cart",
      onClick: onViewCart,
    },
  });
}
