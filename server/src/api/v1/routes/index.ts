import { Router } from "express";
import { pool } from "../../../database/pool";
import { couponSchemaReady } from "../../../lib/coupon-schema";
import { asyncHandler } from "../../../middleware/asyncHandler";
import { addressRouter } from "../../../modules/addresses/routes/address.routes";
import { adminRouter } from "../../../modules/admin/admin.routes";
import { cartRouter } from "../../../modules/cart/routes/cart.routes";
import { couponRouter } from "../../../modules/coupons/routes/coupon.routes";
import { categoryRouter } from "../../../modules/categories/routes/category.routes";
import { orderRouter } from "../../../modules/orders/routes/order.routes";
import { paymentRouter } from "../../../modules/payments/routes/payment.routes";
import { productRouter } from "../../../modules/products/routes/product.routes";
import { settingsRouter } from "../../../modules/settings/routes/settings.routes";

const v1Router = Router();

v1Router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "urja-basket-api", version: "v1" });
});

/** Verifies MySQL pool (runs `SELECT 1`). */
v1Router.get(
  "/health/db",
  asyncHandler(async (_req, res) => {
    try {
      await pool.query("SELECT 1 AS ok");
      const couponsReady = await couponSchemaReady();
      let couponCount = 0;
      if (couponsReady) {
        const [rows] = await pool.query("SELECT COUNT(*) AS c FROM coupons");
        couponCount = Number((rows as { c: number }[])[0]?.c ?? 0);
      }
      res.json({
        ok: true,
        database: "connected",
        coupons: { schemaReady: couponsReady, count: couponCount },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(503).json({ ok: false, database: "disconnected", message });
    }
  })
);

v1Router.use("/admin", adminRouter);
v1Router.use("/addresses", addressRouter);
v1Router.use("/cart", cartRouter);
v1Router.use("/coupons", couponRouter);
v1Router.use("/orders", orderRouter);
v1Router.use("/payments", paymentRouter);
v1Router.use("/categories", categoryRouter);
v1Router.use("/products", productRouter);
v1Router.use("/settings", settingsRouter);

export { v1Router };
