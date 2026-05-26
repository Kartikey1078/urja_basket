"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Package, X } from "lucide-react";

import { mainNav } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { useAdminUiStore } from "@/stores/admin-ui";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useAdminUiStore();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setSidebarOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh bg-slate-50 text-slate-900">
      <button
        type="button"
        aria-label="Close menu"
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/50 transition-opacity md:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[min(18rem,88vw)] flex-col border-r border-slate-200 bg-white shadow-lg transition-transform duration-200 ease-out md:static md:z-0 md:w-56 md:shrink-0 md:translate-x-0 md:shadow-none lg:w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-4">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-2 font-semibold tracking-tight text-emerald-900"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white">
              <Package className="size-5" aria-hidden />
            </span>
            <span className="truncate text-sm sm:text-base">Urja Admin</span>
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label="Main">
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

        <div className="border-t border-slate-100 p-2">
          <button
            type="button"
            onClick={() => void logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <LogOut className="size-5 shrink-0" aria-hidden />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            onClick={toggleSidebar}
            aria-label="Open navigation"
          >
            <Menu className="size-6" />
          </button>
          <span className="truncate text-sm font-semibold text-slate-800">Menu</span>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
