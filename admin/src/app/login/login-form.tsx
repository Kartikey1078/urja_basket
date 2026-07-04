"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { AdminSpinner } from "@/components/loader";
import { adminToast } from "@/lib/admin-toast";

const inputClass =
  "mt-1 block w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25";
const btnPrimary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        const message = j.error ?? "Sign-in failed";
        setError(message);
        adminToast.error(message);
        return;
      }
      adminToast.success("Signed in successfully.");
      router.replace(from.startsWith("/") ? from : "/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Urja Basket</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Admin sign in</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with your staff email, or leave email empty to use the bootstrap password.
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={(e) => void onSubmit(e)}>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              className={inputClass}
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ops@urjabasket.com"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              className={inputClass}
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className={`${btnPrimary} w-full gap-2`} disabled={loading}>
            {loading ? <AdminSpinner size="sm" className="border-white/30 border-t-white" /> : null}
            {loading ? "Signing in…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
