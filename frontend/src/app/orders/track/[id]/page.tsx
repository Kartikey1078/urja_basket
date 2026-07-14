import { OrderTrackingScreen } from "@/features/orders/order-tracking-screen";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Track Order",
  description: "Track your Urja Basket delivery in real time.",
  path: "/orders/track",
  noindex: true,
});

export default function OrderTrackPage() {
  return <OrderTrackingScreen />;
}
