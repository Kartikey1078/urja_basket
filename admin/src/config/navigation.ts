import {
  BarChart3,
  CreditCard,
  FolderTree,
  LayoutDashboard,
  Package,
  Percent,
  Salad,
  Settings,
  Shield,
  Star,
  Store,
  Ticket,
  Users,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const mainNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: FolderTree },
  { href: "/nutrition-tags", label: "Nutrition tags", icon: Salad },
  { href: "/orders", label: "Orders", icon: Ticket },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/coupons", label: "Coupons", icon: Percent },
  { href: "/inventory", label: "Inventory", icon: Warehouse },
  { href: "/pos", label: "POS", icon: Store },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin-users", label: "Admin users", icon: Shield },
];
