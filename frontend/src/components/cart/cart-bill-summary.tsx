import { formatInr } from "@/lib/cart/pricing";
import type { BillSummary } from "@/lib/cart/types";

type CartBillSummaryProps = {
  bill: BillSummary;
};

export function CartBillSummary({ bill }: CartBillSummaryProps) {
  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
      <h2 className="text-urja-forest mb-3 text-base font-bold">Bill Summary</h2>
      <dl className="space-y-2.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Item Total</dt>
          <dd className="text-urja-forest font-medium">{formatInr(bill.itemTotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Delivery Fee</dt>
          <dd className="flex items-center gap-2 font-medium">
            {bill.deliveryFeeWaived ? (
              <>
                <span className="text-muted-foreground line-through">
                  {formatInr(bill.deliveryFee)}
                </span>
                <span className="text-[#4B7E37] font-bold">FREE</span>
              </>
            ) : (
              <span className="text-urja-forest">{formatInr(bill.deliveryFee)}</span>
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Packaging Charges</dt>
          <dd className="text-urja-forest font-medium">
            {formatInr(bill.packagingCharges)}
          </dd>
        </div>
        {(bill.sitePromoDiscount ?? 0) > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Promo discount</dt>
            <dd className="font-semibold text-[#4B7E37]">
              -{formatInr(bill.sitePromoDiscount!)}
            </dd>
          </div>
        ) : null}
        {(bill.couponDiscount ?? 0) > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Coupon discount</dt>
            <dd className="font-semibold text-[#4B7E37]">
              -{formatInr(bill.couponDiscount!)}
            </dd>
          </div>
        ) : null}
        {bill.discount > 0 &&
        !(bill.sitePromoDiscount || bill.couponDiscount) ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Discount</dt>
            <dd className="font-semibold text-[#4B7E37]">-{formatInr(bill.discount)}</dd>
          </div>
        ) : null}
        <div className="border-border/60 flex justify-between gap-4 border-t pt-3">
          <dt className="text-urja-forest text-base font-bold">To Pay</dt>
          <dd className="text-urja-forest text-lg font-bold">{formatInr(bill.toPay)}</dd>
        </div>
      </dl>
    </section>
  );
}
