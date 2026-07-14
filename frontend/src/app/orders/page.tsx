import { OrdersListScreen } from "@/features/orders/orders-list-screen";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Your Orders",
  description: "View your Urja Basket order history and track deliveries.",
  path: "/orders",
  noindex: true,
});

export default function OrdersPage() {
  return <OrdersListScreen />;
}
