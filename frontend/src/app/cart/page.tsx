import { CartScreen } from "@/features/cart/cart-screen";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "My Cart",
  description: "Review items in your Urja Basket cart and proceed to checkout.",
  path: "/cart",
  noindex: true,
});

export default function CartPage() {
  return <CartScreen />;
}
