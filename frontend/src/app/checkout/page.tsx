import { redirect } from "next/navigation";

/** Legacy route — checkout now lives inline on /cart */
export default function CheckoutPage() {
  redirect("/cart?checkout=1");
}
