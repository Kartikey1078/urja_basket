import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAdmin } from "../../middleware/requireAdmin";
import * as admin from "./admin.controller";
import * as adminAnalytics from "./admin.analytics.controller";
import * as adminInventory from "./admin.inventory.controller";
import * as adminEvents from "./admin.events.controller";
import * as adminOrders from "./admin.orders.controller";
import * as adminSettings from "./admin.settings.controller";
import * as adminUsers from "./admin-users.controller";
import * as adminCoupons from "./admin.coupons.controller";
import * as adminNutritionTags from "../nutrition-tags/admin.nutrition-tags.controller";
import * as posController from "../pos/pos.controller";

const r = Router();

/** Sign-in verification for the admin Next.js app (internal header, not ADMIN_API_KEY). */
r.post("/authenticate", asyncHandler(adminUsers.adminAuthenticate));

r.use(requireAdmin);

/** Live order events (SSE) for admin dashboard */
r.get("/events", adminEvents.adminOrderEvents);

/** Categories */
r.get("/categories", asyncHandler(admin.adminListCategories));
r.get("/categories/:id", asyncHandler(admin.adminGetCategory));
r.post("/categories", asyncHandler(admin.adminCreateCategory));
r.patch("/categories/:id", asyncHandler(admin.adminUpdateCategory));
r.delete("/categories/:id", asyncHandler(admin.adminDeleteCategory));

/** Nutrition tag catalog */
r.get("/nutrition-tags", asyncHandler(adminNutritionTags.adminListNutritionTags));
r.post("/nutrition-tags", asyncHandler(adminNutritionTags.adminCreateNutritionTag));
r.patch("/nutrition-tags/:id", asyncHandler(adminNutritionTags.adminUpdateNutritionTag));
r.delete("/nutrition-tags/:id", asyncHandler(adminNutritionTags.adminDeleteNutritionTag));

/** Products — list/create before `/:id` */
r.get("/products", asyncHandler(admin.adminListProducts));
r.post("/products", asyncHandler(admin.adminCreateProduct));

/** Variants nested under product (before /products/:id) */
r.get("/products/:productId/variants", asyncHandler(admin.adminListVariants));
r.post("/products/:productId/variants", asyncHandler(admin.adminCreateVariant));

r.get("/products/:id", asyncHandler(admin.adminGetProduct));
r.patch("/products/:id", asyncHandler(admin.adminUpdateProduct));
r.delete("/products/:id", asyncHandler(admin.adminDeleteProduct));

/** Variants by id */
r.patch("/variants/:id", asyncHandler(admin.adminUpdateVariant));
r.delete("/variants/:id", asyncHandler(admin.adminDeleteVariant));

/** Reviews */
r.get("/reviews", asyncHandler(admin.adminListReviews));
r.patch("/reviews/:id", asyncHandler(admin.adminUpdateReview));
r.delete("/reviews/:id", asyncHandler(admin.adminDeleteReview));

/** Analytics & inventory */
r.get("/analytics", asyncHandler(adminAnalytics.adminGetAnalytics));
r.get("/inventory/summary", asyncHandler(adminInventory.adminGetInventorySummary));
r.get("/inventory", asyncHandler(adminInventory.adminListInventory));
r.get("/inventory/products/:productId/variants", asyncHandler(adminInventory.adminListInventoryVariants));
r.patch("/inventory/products/:id/stock", asyncHandler(adminInventory.adminUpdateProductStock));
r.patch("/inventory/variants/:id/stock", asyncHandler(adminInventory.adminUpdateVariantStock));

/** Coupons */
r.get("/coupons/analytics", asyncHandler(adminCoupons.adminCouponAnalytics));
r.get("/coupons/abuse-logs", asyncHandler(adminCoupons.adminCouponAbuseLogs));
r.get("/coupons", asyncHandler(adminCoupons.adminListCoupons));
r.post("/coupons", asyncHandler(adminCoupons.adminCreateCoupon));
r.get("/coupons/:id", asyncHandler(adminCoupons.adminGetCoupon));
r.patch("/coupons/:id", asyncHandler(adminCoupons.adminUpdateCoupon));
r.delete("/coupons/:id", asyncHandler(adminCoupons.adminDeleteCoupon));

/** Orders, customers, payments */
r.get("/orders", asyncHandler(adminOrders.adminListOrders));
r.get("/orders/:id", asyncHandler(adminOrders.adminGetOrder));
r.patch("/orders/:id/mark-cod-paid", asyncHandler(adminOrders.adminMarkCodPaid));
r.patch("/orders/:id/confirm", asyncHandler(adminOrders.adminConfirmCodOrder));
r.patch("/orders/:id/cancel", asyncHandler(adminOrders.adminCancelOrder));
r.patch("/orders/:id/refund", asyncHandler(adminOrders.adminRefundOrder));
r.patch("/orders/:id/fulfillment", asyncHandler(adminOrders.adminUpdateFulfillment));
r.get("/payments", asyncHandler(adminOrders.adminListPayments));
r.get("/customers", asyncHandler(adminOrders.adminListCustomers));
r.get("/customers/:id", asyncHandler(adminOrders.adminGetCustomer));

/** Store settings */
r.get("/settings", asyncHandler(adminSettings.adminGetSettings));
r.patch("/settings", asyncHandler(adminSettings.adminUpdateSettings));

/** Admin console users */
r.get("/admin-users", asyncHandler(adminUsers.adminListAdminUsers));
r.post("/admin-users", asyncHandler(adminUsers.adminCreateAdminUser));
r.patch("/admin-users/:id", asyncHandler(adminUsers.adminUpdateAdminUser));
r.delete("/admin-users/:id", asyncHandler(adminUsers.adminDeleteAdminUser));

/** Point of sale (walk-in) */
r.get("/pos/products/search", asyncHandler(posController.searchProducts));
r.post("/pos/orders", asyncHandler(posController.createOrder));
r.post("/pos/orders/checkout/cash", asyncHandler(posController.checkoutCash));
r.get("/pos/orders", asyncHandler(posController.listOrders));
r.get("/pos/orders/:id", asyncHandler(posController.getOrder));
r.get("/pos/orders/:id/invoice", asyncHandler(posController.getInvoice));
r.post("/pos/orders/:id/pay/cash", asyncHandler(posController.payCash));
r.post("/pos/orders/:id/cancel", asyncHandler(posController.cancelOrder));

export { r as adminRouter };
