"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Package, X } from "lucide-react";
import { useEffect } from "react";

import { mainNav } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { useAdminUiStore } from "@/stores/admin-ui";

function pageTitleFromPath(pathname: string): string {
  const item = mainNav.find(
    (n) => pathname === n.href || pathname.startsWith(`${n.href}/`)
  );
  if (item) return item.label;
  if (pathname.startsWith("/orders/")) return "Order detail";
  if (pathname.startsWith("/customers/")) return "Customer";
  if (pathname.startsWith("/products/")) return "Product";
  return "Urja Admin";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useAdminUiStore();
  const pageTitle = pageTitleFromPath(pathname);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setSidebarOpen(false);
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setSidebarOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const lockScroll = () => sidebarOpen && mq.matches;
    const apply = () => {
      document.body.style.overflow = lockScroll() ? "hidden" : "";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setSidebarOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50 text-slate-900">
      {/* Mobile / tablet backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={sidebarOpen ? 0 : -1}
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/50 transition-opacity duration-200 lg:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar — drawer below lg, fixed rail at lg+ */}
      <aside
        id="admin-sidebar"
        aria-label="Admin navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(17.5rem,88vw)] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 ease-out lg:relative lg:z-auto lg:h-dvh lg:w-56 lg:shrink-0 lg:translate-x-0 lg:shadow-none xl:w-60",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-3 py-3 sm:px-4 sm:py-4">
          <Link
            href="/dashboard"
            className="flex min-w-0 flex-1 items-center gap-2 font-semibold tracking-tight text-emerald-900"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white">
              <Package className="size-5" aria-hidden />
            </span>
            <span className="truncate text-sm sm:text-base">Urja Admin</span>
          </Link>
          <button
            type="button"
            className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <nav className="space-y-0.5" aria-label="Main">
            {mainNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-emerald-50 text-emerald-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="size-5 shrink-0 opacity-80" aria-hidden />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => void logout()}
            className="mt-2 flex w-full items-center gap-3 rounded-lg border-t border-slate-100 px-3 py-2.5 pt-3 text-left text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <LogOut className="size-5 shrink-0" aria-hidden />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main column — scrolls independently from sidebar */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:px-4 lg:hidden">
          <button
            type="button"
            className="shrink-0 rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            onClick={toggleSidebar}
            aria-expanded={sidebarOpen}
            aria-controls="admin-sidebar"
            aria-label="Open navigation"
          >
            <Menu className="size-6" />
          </button>
          <span className="min-w-0 truncate text-sm font-semibold text-slate-800">{pageTitle}</span>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8 xl:px-8">
          <div className="mx-auto w-full max-w-[96rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}
