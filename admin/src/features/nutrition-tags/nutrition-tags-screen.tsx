"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

import { PageHeader } from "@/components/page-header";
import { AdminTableLoader } from "@/components/loader";
import { adminFetchJson } from "@/lib/api-client";
import { adminToast } from "@/lib/admin-toast";
import type { NutritionTagCatalog } from "@/lib/types";

const inputClass =
  "mt-1 block w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25";
const btnPrimary =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";
const btnGhost =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50";
const btnDanger =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-800 hover:bg-red-100";

export function NutritionTagsScreen() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["admin", "nutrition-tags"],
    queryFn: () =>
      adminFetchJson<{ data: NutritionTagCatalog[] }>("nutrition-tags").then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (body: {
      name: string;
      slug: string;
      image_url: string | null;
      sort_order: number;
    }) => adminFetchJson<{ data: { id: number } }>("nutrition-tags", { method: "POST", json: body }),
    onSuccess: () => {
      adminToast.created("Nutrition tag");
      void qc.invalidateQueries({ queryKey: ["admin", "nutrition-tags"] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  const update = useMutation({
    mutationFn: (args: {
      id: number;
      body: Partial<{
        name: string;
        slug: string;
        image_url: string | null;
        sort_order: number;
      }>;
    }) => adminFetchJson(`nutrition-tags/${args.id}`, { method: "PATCH", json: args.body }),
    onSuccess: () => {
      adminToast.updated("Nutrition tag");
      void qc.invalidateQueries({ queryKey: ["admin", "nutrition-tags"] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adminFetchJson(`nutrition-tags/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      adminToast.deleted("Nutrition tag");
      void qc.invalidateQueries({ queryKey: ["admin", "nutrition-tags"] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  return (
    <div>
      <PageHeader
        title="Nutrition tags"
        description="Manage nutrition filter labels and images shown on the storefront."
      />
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">New nutrition tag</h2>
        <p className="mt-1 text-xs text-slate-500">
          Tag names must match what you assign on products (e.g. Vitamin C).
        </p>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const name = String(fd.get("name") ?? "").trim();
            const slug = String(fd.get("slug") ?? "").trim();
            const imageRaw = String(fd.get("image_url") ?? "").trim();
            create.mutate({
              name,
              slug,
              image_url: imageRaw || null,
              sort_order: Number(fd.get("sort_order") ?? 0),
            });
            e.currentTarget.reset();
          }}
        >
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input className={inputClass} name="name" required placeholder="Vitamin C" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Slug
            <input className={inputClass} name="slug" required placeholder="vitamin-c" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Image URL
            <input className={inputClass} name="image_url" placeholder="https://…" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Sort order
            <input className={inputClass} name="sort_order" type="number" defaultValue={0} />
          </label>
          <div className="sm:col-span-2 lg:col-span-4">
            <button type="submit" className={btnPrimary} disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create tag"}
            </button>
          </div>
        </form>
      </section>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-3 py-3 sm:px-4">Preview</th>
              <th className="px-3 py-3 sm:px-4">Name</th>
              <th className="px-3 py-3 sm:px-4">Slug</th>
              <th className="px-3 py-3 sm:px-4">Sort</th>
              <th className="px-3 py-3 sm:px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.isPending ? <AdminTableLoader colSpan={5} /> : null}
            {list.data?.map((row) => (
              <tr key={row.id}>
                <td className="px-3 py-3 sm:px-4">
                  <span className="relative block size-10 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
                    {row.image_url ? (
                      <Image
                        src={row.image_url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-[10px] text-slate-400">
                        —
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-3 py-3 font-medium text-slate-900 sm:px-4">{row.name}</td>
                <td className="px-3 py-3 text-slate-600 sm:px-4">{row.slug}</td>
                <td className="px-3 py-3 text-slate-600 sm:px-4">{row.sort_order}</td>
                <td className="px-3 py-3 sm:px-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={btnGhost}
                      onClick={() => {
                        const name = window.prompt("Name", row.name);
                        if (name == null) return;
                        const image_url = window.prompt("Image URL", row.image_url ?? "");
                        update.mutate({
                          id: row.id,
                          body: {
                            name: name.trim(),
                            image_url: image_url?.trim() || null,
                          },
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={btnDanger}
                      onClick={() => {
                        if (window.confirm(`Delete "${row.name}"?`)) remove.mutate(row.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
