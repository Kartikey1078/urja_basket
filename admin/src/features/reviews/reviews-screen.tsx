"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { AdminPageLoader, AdminTableLoader } from "@/components/loader";
import { adminFetchJson } from "@/lib/api-client";
import { adminToast } from "@/lib/admin-toast";
import type { Review } from "@/lib/types";

const inputClass =
  "mt-1 block w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25";
const btnPrimary =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";
const btnDanger =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-800 hover:bg-red-100";

export function ReviewsScreen() {
  return (
    <Suspense fallback={<AdminPageLoader />}>
      <ReviewsInner />
    </Suspense>
  );
}

function ReviewsInner() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId")?.trim() ?? "";
  const qs = productId !== "" ? `?productId=${encodeURIComponent(productId)}` : "";
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["admin", "reviews", productId],
    queryFn: () => adminFetchJson<{ data: Review[] }>(`reviews${qs}`).then((r) => r.data),
  });

  const update = useMutation({
    mutationFn: (args: { id: number; body: { rating?: number; comment?: string | null } }) =>
      adminFetchJson(`reviews/${args.id}`, { method: "PATCH", json: args.body }),
    onSuccess: () => {
      adminToast.updated("Review");
      void qc.invalidateQueries({ queryKey: ["admin", "reviews", productId] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adminFetchJson(`reviews/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      adminToast.deleted("Review");
      void qc.invalidateQueries({ queryKey: ["admin", "reviews", productId] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  return (
    <div>
      <PageHeader
        title="Reviews"
        description="Filter by product id (optional). Updates sync product aggregates on the server."
      />

      <form
        className="mb-6 flex max-w-md flex-col gap-3 sm:flex-row sm:items-end"
        action="/reviews"
        method="get"
      >
        <label className="block flex-1 text-sm font-medium text-slate-700">
          Product ID
          <input
            className={inputClass}
            name="productId"
            defaultValue={productId}
            placeholder="e.g. 1"
            inputMode="numeric"
          />
        </label>
        <button type="submit" className={`${btnPrimary} shrink-0`}>
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-3 py-3 sm:px-4">ID</th>
              <th className="px-3 py-3 sm:px-4">Product</th>
              <th className="px-3 py-3 sm:px-4">User</th>
              <th className="px-3 py-3 sm:px-4">Review</th>
              <th className="px-3 py-3 sm:px-4">Edit / delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.isPending ? (
              <AdminTableLoader colSpan={5} />
            ) : null}
            {list.error ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-red-700">
                  {(list.error as Error).message}
                </td>
              </tr>
            ) : null}
            {list.data?.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="px-3 py-3 font-mono text-xs sm:px-4">{r.id}</td>
                <td className="px-3 py-3 sm:px-4">{r.product_id}</td>
                <td className="px-3 py-3 sm:px-4">{r.user_id}</td>
                <td className="max-w-xs px-3 py-3 sm:px-4">
                  <p className="text-xs font-semibold text-emerald-900">{r.rating} / 5</p>
                  <p className="line-clamp-3 text-xs text-slate-600">{r.comment?.trim() || "—"}</p>
                </td>
                <td className="min-w-[12rem] px-3 py-3 sm:px-4">
                  <form
                    className="flex flex-col gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      update.mutate({
                        id: r.id,
                        body: {
                          rating: Number(fd.get("rating")),
                          comment: String(fd.get("comment") ?? ""),
                        },
                      });
                    }}
                  >
                    <label className="text-xs font-medium text-slate-600">
                      Rating (1–5)
                      <input
                        name="rating"
                        type="number"
                        min={1}
                        max={5}
                        defaultValue={r.rating}
                        className={inputClass}
                      />
                    </label>
                    <label className="text-xs font-medium text-slate-600">
                      Comment
                      <textarea name="comment" rows={2} defaultValue={r.comment ?? ""} className={inputClass} />
                    </label>
                    <button type="submit" className={btnPrimary} disabled={update.isPending}>
                      Save
                    </button>
                  </form>
                  <button
                    type="button"
                    className={`${btnDanger} mt-2 w-full`}
                    disabled={remove.isPending}
                    onClick={() => {
                      if (typeof window !== "undefined" && window.confirm("Delete this review?")) {
                        remove.mutate(r.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
