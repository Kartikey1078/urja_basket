import type { RowDataPacket } from "mysql2";

import { pool } from "../../../database/pool";

export type AnalyticsOverview = {
  revenue: {
    total: string;
    today: string;
    week: string;
    month: string;
  };
  orders: {
    total: number;
    paid: number;
    pending_payment: number;
    failed: number;
    cancelled: number;
    today: number;
    week: number;
  };
  payments: {
    total: number;
    paid: number;
    created: number;
    failed: number;
  };
  customers: {
    total: number;
    with_orders: number;
  };
  catalog: {
    products: number;
    categories: number;
    low_stock_products: number;
    out_of_stock_products: number;
  };
  revenueByDay: { date: string; revenue: string; order_count: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: {
    product_slug: string;
    product_name: string;
    units_sold: number;
    revenue: string;
  }[];
  recentOrders: {
    id: number;
    order_number: string;
    customer_name: string;
    grand_total: string;
    status: string;
    created_at: Date;
  }[];
};

type SumPacket = RowDataPacket & {
  total_revenue: string;
  revenue_today: string;
  revenue_week: string;
  revenue_month: string;
};

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const [revenueRows] = await pool.query<SumPacket[]>(
    `SELECT
      COALESCE(SUM(CASE WHEN status = 'paid' THEN grand_total ELSE 0 END), 0) AS total_revenue,
      COALESCE(SUM(CASE WHEN status = 'paid' AND DATE(created_at) = CURDATE() THEN grand_total ELSE 0 END), 0) AS revenue_today,
      COALESCE(SUM(CASE WHEN status = 'paid' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) THEN grand_total ELSE 0 END), 0) AS revenue_week,
      COALESCE(SUM(CASE WHEN status = 'paid' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY) THEN grand_total ELSE 0 END), 0) AS revenue_month
     FROM orders`
  );

  const revenue = revenueRows[0];

  const [orderCountRows] = await pool.query<
    (RowDataPacket & {
      total: number;
      paid: number;
      pending_payment: number;
      failed: number;
      cancelled: number;
      today: number;
      week: number;
    })[]
  >(
    `SELECT
      COUNT(*) AS total,
      SUM(status = 'paid') AS paid,
      SUM(status = 'pending_payment') AS pending_payment,
      SUM(status = 'failed') AS failed,
      SUM(status = 'cancelled') AS cancelled,
      SUM(DATE(created_at) = CURDATE()) AS today,
      SUM(created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)) AS week
     FROM orders`
  );

  const orderCounts = orderCountRows[0];

  const [paymentCountRows] = await pool.query<
    (RowDataPacket & { total: number; paid: number; created: number; failed: number })[]
  >(
    `SELECT
      COUNT(*) AS total,
      SUM(status = 'paid') AS paid,
      SUM(status = 'created') AS created,
      SUM(status = 'failed') AS failed
     FROM payments`
  );

  const paymentCounts = paymentCountRows[0];

  const [customerCountRows] = await pool.query<
    (RowDataPacket & { total: number; with_orders: number })[]
  >(
    `SELECT
      (SELECT COUNT(*) FROM users) AS total,
      (SELECT COUNT(DISTINCT user_id) FROM orders WHERE user_id IS NOT NULL) AS with_orders`
  );

  const customerCounts = customerCountRows[0];

  const [catalogCountRows] = await pool.query<
    (RowDataPacket & {
      products: number;
      categories: number;
      low_stock: number;
      out_of_stock: number;
    })[]
  >(
    `SELECT
      (SELECT COUNT(*) FROM products) AS products,
      (SELECT COUNT(*) FROM categories) AS categories,
      (SELECT COUNT(*) FROM (
        SELECT p.id,
          CASE
            WHEN (SELECT COUNT(*) FROM product_variants pv WHERE pv.product_id = p.id) > 0
            THEN (SELECT COALESCE(SUM(pv.stock), 0) FROM product_variants pv WHERE pv.product_id = p.id)
            ELSE p.stock
          END AS effective_stock
        FROM products p
      ) x WHERE effective_stock > 0 AND effective_stock <= 10) AS low_stock,
      (SELECT COUNT(*) FROM (
        SELECT p.id,
          CASE
            WHEN (SELECT COUNT(*) FROM product_variants pv WHERE pv.product_id = p.id) > 0
            THEN (SELECT COALESCE(SUM(pv.stock), 0) FROM product_variants pv WHERE pv.product_id = p.id)
            ELSE p.stock
          END AS effective_stock
        FROM products p
      ) x WHERE effective_stock = 0) AS out_of_stock`
  );

  const catalogCounts = catalogCountRows[0];

  const [revenueByDay] = await pool.query<
    (RowDataPacket & { date: Date; revenue: string; order_count: number })[]
  >(
    `SELECT DATE(created_at) AS date,
            COALESCE(SUM(grand_total), 0) AS revenue,
            COUNT(*) AS order_count
     FROM orders
     WHERE status = 'paid'
       AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY DATE(created_at)
     ORDER BY date ASC`
  );

  const [ordersByStatus] = await pool.query<(RowDataPacket & { status: string; count: number })[]>(
    `SELECT status, COUNT(*) AS count FROM orders GROUP BY status ORDER BY count DESC`
  );

  const [topProducts] = await pool.query<
    (RowDataPacket & {
      product_slug: string;
      product_name: string;
      units_sold: number;
      revenue: string;
    })[]
  >(
    `SELECT oi.product_slug, oi.product_name,
            SUM(oi.quantity) AS units_sold,
            COALESCE(SUM(oi.line_total), 0) AS revenue
     FROM order_items oi
     INNER JOIN orders o ON o.id = oi.order_id AND o.status = 'paid'
     GROUP BY oi.product_slug, oi.product_name
     ORDER BY units_sold DESC
     LIMIT 8`
  );

  const [recentOrders] = await pool.query<
    (RowDataPacket & {
      id: number;
      order_number: string;
      customer_name: string;
      grand_total: string;
      status: string;
      created_at: Date;
    })[]
  >(
    `SELECT id, order_number, customer_name, grand_total, status, created_at
     FROM orders
     ORDER BY created_at DESC
     LIMIT 8`
  );

  return {
    revenue: {
      total: String(revenue?.total_revenue ?? 0),
      today: String(revenue?.revenue_today ?? 0),
      week: String(revenue?.revenue_week ?? 0),
      month: String(revenue?.revenue_month ?? 0),
    },
    orders: {
      total: Number(orderCounts?.total ?? 0),
      paid: Number(orderCounts?.paid ?? 0),
      pending_payment: Number(orderCounts?.pending_payment ?? 0),
      failed: Number(orderCounts?.failed ?? 0),
      cancelled: Number(orderCounts?.cancelled ?? 0),
      today: Number(orderCounts?.today ?? 0),
      week: Number(orderCounts?.week ?? 0),
    },
    payments: {
      total: Number(paymentCounts?.total ?? 0),
      paid: Number(paymentCounts?.paid ?? 0),
      created: Number(paymentCounts?.created ?? 0),
      failed: Number(paymentCounts?.failed ?? 0),
    },
    customers: {
      total: Number(customerCounts?.total ?? 0),
      with_orders: Number(customerCounts?.with_orders ?? 0),
    },
    catalog: {
      products: Number(catalogCounts?.products ?? 0),
      categories: Number(catalogCounts?.categories ?? 0),
      low_stock_products: Number(catalogCounts?.low_stock ?? 0),
      out_of_stock_products: Number(catalogCounts?.out_of_stock ?? 0),
    },
    revenueByDay: revenueByDay.map((r) => ({
      date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date),
      revenue: String(r.revenue),
      order_count: Number(r.order_count),
    })),
    ordersByStatus: ordersByStatus.map((r) => ({
      status: r.status,
      count: Number(r.count),
    })),
    topProducts: topProducts.map((r) => ({
      product_slug: r.product_slug,
      product_name: r.product_name,
      units_sold: Number(r.units_sold),
      revenue: String(r.revenue),
    })),
    recentOrders: recentOrders.map((r) => ({
      id: r.id,
      order_number: r.order_number,
      customer_name: r.customer_name,
      grand_total: String(r.grand_total),
      status: r.status,
      created_at: r.created_at,
    })),
  };
}
