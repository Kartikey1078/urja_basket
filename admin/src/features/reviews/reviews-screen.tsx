"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Star } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { AdminPageLoader, AdminTableLoader } from "@/components/loader";
import { adminFetchJson } from "@/lib/api-client";
import { adminToast } from "@/lib/admin-toast";
import type { ProductListRow, Review } from "@/lib/types";

const inputClass =
  "mt-1 block w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25";
const btnPrimary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";
const btnDanger =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-800 hover:bg-red-100";

function reviewAuthorLabel(userId: number) {
  return userId === 0 ? "Admin" : String(userId);
}

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
  const [createProductId, setCreateProductId] = useState(productId);
  const [createRating, setCreateRating] = useState("5");
  const [createComment, setCreateComment] = useState("");

  useEffect(() => {
    if (productId) setCreateProductId(productId);
  }, [productId]);

  const products = useQuery({
    queryKey: ["admin", "products", "review-picker"],
    queryFn: () =>
      adminFetchJson<{ data: ProductListRow[] }>("products?limit=100&sort=name_asc").then(
        (r) => r.data
      ),
  });

  const list = useQuery({
    queryKey: ["admin", "reviews", productId],
    queryFn: () => adminFetchJson<{ data: Review[] }>(`reviews${qs}`).then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (body: { productId: number; rating: number; comment?: string | null }) =>
      adminFetchJson<{ data: { id: number } }>("reviews", { method: "POST", json: body }),
    onSuccess: () => {
      adminToast.created("Review");
      setCreateComment("");
      void qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  const update = useMutation({
    mutationFn: (args: { id: number; body: { rating?: number; comment?: string | null } }) =>
      adminFetchJson(`reviews/${args.id}`, { method: "PATCH", json: args.body }),
    onSuccess: () => {
      adminToast.updated("Review");
      void qc.invalidateQueries({ queryKey: ["admin", "reviews", productId] });
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adminFetchJson(`reviews/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      adminToast.deleted("Review");
      void qc.invalidateQueries({ queryKey: ["admin", "reviews", productId] });
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  return (
    <div>
      <PageHeader
        title="Reviews"
        description="Add ratings for products or edit existing reviews. Product stars update automatically."
      />

      <section className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-700 text-white">
            <Plus className="size-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-emerald-950">Add review</h2>
            <p className="text-xs text-emerald-900/75">
              Pick a product and rating. This updates the storefront stars immediately.
            </p>
          </div>
        </div>

        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            const pid = Number(createProductId);
            const rating = Number(createRating);
            if (!Number.isInteger(pid) || pid <= 0) {
              adminToast.fromError(new Error("Select a valid product"));
              return;
            }
            create.mutate({
              productId: pid,
              rating,
              comment: createComment.trim() || null,
            });
          }}
        >
          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            Product
            <select
              className={inputClass}
              value={createProductId}
              onChange={(e) => setCreateProductId(e.target.value)}
              required
              disabled={products.isPending || create.isPending}
            >
              <option value="" disabled>
                {products.isPending ? "Loading products…" : "Select a product"}
              </option>
              {products.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.id} — {p.name} ({Number(p.average_rating).toFixed(1)}★ · {p.total_reviews}{" "}
                  reviews)
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Rating
            <select
              className={inputClass}
              value={createRating}
              onChange={(e) => setCreateRating(e.target.value)}
              required
              disabled={create.isPending}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} ★
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-4">
            Comment <span className="font-normal text-slate-500">(optional)</span>
            <textarea
              className={inputClass}
              rows={2}
              value={createComment}
              onChange={(e) => setCreateComment(e.target.value)}
              placeholder="e.g. Fresh quality, fast delivery"
              disabled={create.isPending}
            />
          </label>

          <div className="sm:col-span-2 lg:col-span-4">
            <button type="submit" className={btnPrimary} disabled={create.isPending || products.isPending}>
              <Star className="size-4" aria-hidden />
              {create.isPending ? "Adding…" : "Add review"}
            </button>
          </div>
        </form>
      </section>

      <form
        className="mb-6 flex max-w-md flex-col gap-3 sm:flex-row sm:items-end"
        action="/reviews"
        method="get"
      >
        <label className="block flex-1 text-sm font-medium text-slate-700">
          Filter by product ID
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
              <th className="px-3 py-3 sm:px-4">Author</th>
              <th className="px-3 py-3 sm:px-4">Review</th>
              <th className="px-3 py-3 sm:px-4">Edit / delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.isPending ? <AdminTableLoader colSpan={5} /> : null}
            {list.error ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-red-700">
                  {(list.error as Error).message}
                </td>
              </tr>
            ) : null}
            {!list.isPending && !list.error && list.data?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No reviews yet. Use the form above to add the first rating.
                </td>
              </tr>
            ) : null}
            {list.data?.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="px-3 py-3 font-mono text-xs sm:px-4">{r.id}</td>
                <td className="px-3 py-3 sm:px-4">{r.product_id}</td>
                <td className="px-3 py-3 sm:px-4">{reviewAuthorLabel(r.user_id)}</td>
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
                      <textarea
                        name="comment"
                        rows={2}
                        defaultValue={r.comment ?? ""}
                        className={inputClass}
                      />
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
