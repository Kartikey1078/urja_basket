"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { AdminTableLoader } from "@/components/loader";
import { adminFetchJson } from "@/lib/api-client";
import { adminToast } from "@/lib/admin-toast";
import { cn } from "@/lib/cn";
import type { Category } from "@/lib/types";

const inputClass =
  "mt-1 block w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25";
const btnPrimary =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";
const btnGhost =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50";
const btnDanger =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-800 hover:bg-red-100";

export function CategoriesScreen() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminFetchJson<{ data: Category[] }>("categories").then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (body: { name: string; slug: string; image: string | null }) =>
      adminFetchJson<{ data: { id: number } }>("categories", { method: "POST", json: body }),
    onSuccess: () => {
      adminToast.created("Category");
      void qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  const update = useMutation({
    mutationFn: (args: { id: number; body: { name?: string; slug?: string; image?: string | null } }) =>
      adminFetchJson(`categories/${args.id}`, { method: "PATCH", json: args.body }),
    onSuccess: () => {
      adminToast.updated("Category");
      void qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adminFetchJson(`categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      adminToast.deleted("Category");
      void qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  return (
    <div>
      <PageHeader title="Categories" description="Create, update, and delete catalog categories." />

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">New category</h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const name = String(fd.get("name") ?? "").trim();
            const slug = String(fd.get("slug") ?? "").trim();
            const imageRaw = String(fd.get("image") ?? "").trim();
            create.mutate({ name, slug, image: imageRaw === "" ? null : imageRaw });
            e.currentTarget.reset();
          }}
        >
          <label className="block text-sm font-medium text-slate-700 sm:col-span-1">
            Name
            <input className={inputClass} name="name" required />
          </label>
          <label className="block text-sm font-medium text-slate-700 sm:col-span-1">
            Slug
            <input className={inputClass} name="slug" required placeholder="fresh-fruits" />
          </label>
          <label className="block text-sm font-medium text-slate-700 sm:col-span-1">
            Image URL
            <input className={inputClass} name="image" placeholder="https://…" />
          </label>
          <div className="sm:col-span-3">
            <button type="submit" className={btnPrimary} disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create category"}
            </button>
          </div>
        </form>
      </section>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[640px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-3 py-3 sm:px-4">ID</th>
              <th className="px-3 py-3 sm:px-4">Name</th>
              <th className="px-3 py-3 sm:px-4">Slug</th>
              <th className="px-3 py-3 sm:px-4">Image</th>
              <th className="px-3 py-3 sm:px-4">Actions</th>
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
            {list.data?.map((c) => (
              <CategoryRow
                key={c.id}
                c={c}
                onSave={(body) => update.mutate({ id: c.id, body })}
                onDelete={() => {
                  if (typeof window !== "undefined" && window.confirm(`Delete category “${c.name}”?`)) {
                    remove.mutate(c.id);
                  }
                }}
                busy={update.isPending || remove.isPending}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoryRow({
  c,
  onSave,
  onDelete,
  busy,
}: {
  c: Category;
  onSave: (body: { name: string; slug: string; image: string | null }) => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <tr className="align-top">
      <td className="px-3 py-3 font-mono text-xs text-slate-600 sm:px-4">{c.id}</td>
      <td className="px-3 py-3 font-medium text-slate-900 sm:px-4">{c.name}</td>
      <td className="px-3 py-3 text-slate-700 sm:px-4">{c.slug}</td>
      <td className="max-w-[12rem] truncate px-3 py-3 text-xs text-slate-500 sm:px-4">{c.image ?? "—"}</td>
      <td className="px-3 py-3 sm:px-4">
        <button type="button" className={cn(btnGhost, "w-full sm:w-auto")} onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Edit"}
        </button>
        {open ? (
          <form
            className="mt-3 flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = String(fd.get("name") ?? "").trim();
              const slug = String(fd.get("slug") ?? "").trim();
              const imageRaw = String(fd.get("image") ?? "").trim();
              onSave({ name, slug, image: imageRaw === "" ? null : imageRaw });
              setOpen(false);
            }}
          >
            <label className="block text-xs font-medium text-slate-700">
              Name
              <input className={inputClass} name="name" required defaultValue={c.name} />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Slug
              <input className={inputClass} name="slug" required defaultValue={c.slug} />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Image URL
              <input className={inputClass} name="image" defaultValue={c.image ?? ""} />
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="submit" className={btnPrimary} disabled={busy}>
                Save
              </button>
              <button type="button" className={btnDanger} onClick={onDelete} disabled={busy}>
                Delete
              </button>
            </div>
          </form>
        ) : null}
      </td>
    </tr>
  );
}
