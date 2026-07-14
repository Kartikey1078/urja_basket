import { formatInr } from "@/lib/cart/pricing";
import type { BillSummary } from "@/lib/cart/types";

import { cartCardClass } from "./cart-shell";

type CartBillSummaryProps = {
  bill: BillSummary;
};

export function CartBillSummary({ bill }: CartBillSummaryProps) {
  return (
    <section className={`${cartCardClass} p-4 sm:p-5`}>
      <h2 className="text-sm font-semibold text-stone-900">Order summary</h2>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-stone-500">Items</dt>
          <dd className="font-medium tabular-nums text-stone-900">{formatInr(bill.itemTotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-stone-500">Delivery</dt>
          <dd className="font-medium tabular-nums">
            {bill.deliveryFeeWaived || bill.deliveryFee === 0 ? (
              <span className="text-urja-forest">Free</span>
            ) : (
              formatInr(bill.deliveryFee)
            )}
          </dd>
        </div>
        {(bill.couponDiscount ?? 0) > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Coupon</dt>
            <dd className="font-medium tabular-nums text-emerald-700">
              −{formatInr(bill.couponDiscount!)}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-[#eef3ef] px-4 py-3">
        <span className="text-sm font-medium text-stone-700">Total payable</span>
        <span className="text-xl font-semibold tabular-nums text-stone-900">
          {formatInr(bill.toPay)}
        </span>
      </div>
    </section>
  );
}
