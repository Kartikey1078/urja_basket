"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { AdminTableLoader } from "@/components/loader";
import { adminFetchJson } from "@/lib/api-client";
import { adminToast, formatAdminError } from "@/lib/admin-toast";
import { cn } from "@/lib/cn";
import type { AdminUser, AdminUserRole } from "@/lib/types";

const inputClass =
  "mt-1 block w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25";
const btnPrimary =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";
const btnGhost =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50";
const btnDanger =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-800 hover:bg-red-100";

const ROLES: { value: AdminUserRole; label: string; hint: string }[] = [
  { value: "owner", label: "Owner", hint: "Full access; can manage other admins" },
  { value: "manager", label: "Manager", hint: "Catalog, orders, and operations" },
  { value: "staff", label: "Staff", hint: "Day-to-day operations" },
];

function RoleBadge({ role }: { role: AdminUserRole }) {
  const styles: Record<AdminUserRole, string> = {
    owner: "bg-violet-100 text-violet-900",
    manager: "bg-sky-100 text-sky-900",
    staff: "bg-slate-100 text-slate-800",
  };
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize", styles[role])}>
      {role}
    </span>
  );
}

export function AdminUsersScreen() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["admin", "admin-users"],
    queryFn: () => adminFetchJson<{ data: AdminUser[] }>("admin-users").then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (body: { email: string; name: string; password: string; role: AdminUserRole }) =>
      adminFetchJson<{ data: AdminUser }>("admin-users", { method: "POST", json: body }),
    onSuccess: () => {
      adminToast.created("Admin user");
      void qc.invalidateQueries({ queryKey: ["admin", "admin-users"] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  const update = useMutation({
    mutationFn: (args: {
      id: number;
      body: {
        email?: string;
        name?: string;
        role?: AdminUserRole;
        isActive?: boolean;
        password?: string;
      };
    }) => adminFetchJson(`admin-users/${args.id}`, { method: "PATCH", json: args.body }),
    onSuccess: () => {
      adminToast.updated("Admin user");
      void qc.invalidateQueries({ queryKey: ["admin", "admin-users"] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adminFetchJson(`admin-users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      adminToast.deleted("Admin user");
      void qc.invalidateQueries({ queryKey: ["admin", "admin-users"] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  return (
    <div>
      <PageHeader
        title="Admin users"
        description="Staff accounts for this console. Each user signs in with email and password."
      />

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">Invite staff member</h2>
        <p className="mt-1 text-xs text-slate-500">Password must be at least 8 characters. Share credentials securely.</p>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const email = String(fd.get("email") ?? "").trim();
            const name = String(fd.get("name") ?? "").trim();
            const password = String(fd.get("password") ?? "");
            const role = String(fd.get("role") ?? "staff") as AdminUserRole;
            create.mutate({ email, name, password, role });
            e.currentTarget.reset();
          }}
        >
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input className={inputClass} name="name" required placeholder="Priya Sharma" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input className={inputClass} name="email" type="email" required placeholder="ops@urjabasket.com" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Temporary password
            <input className={inputClass} name="password" type="password" required minLength={8} autoComplete="new-password" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Role
            <select className={inputClass} name="role" defaultValue="staff">
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2 lg:col-span-4">
            <button type="submit" className={btnPrimary} disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create admin user"}
            </button>
          </div>
        </form>
      </section>

      <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <strong>Roles:</strong>{" "}
        {ROLES.map((r, i) => (
          <span key={r.value}>
            {i > 0 ? " · " : ""}
            <RoleBadge role={r.value} /> {r.hint}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[800px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-3 py-3 sm:px-4">User</th>
              <th className="px-3 py-3 sm:px-4">Role</th>
              <th className="px-3 py-3 sm:px-4">Status</th>
              <th className="px-3 py-3 sm:px-4">Last login</th>
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
                  {formatAdminError(list.error)}
                </td>
              </tr>
            ) : null}
            {list.data?.length === 0 && !list.isPending ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No admin users yet. Create one above, or sign in with the bootstrap password to get started.
                </td>
              </tr>
            ) : null}
            {list.data?.map((u) => (
              <AdminUserRow
                key={u.id}
                user={u}
                onSave={(body) => update.mutate({ id: u.id, body })}
                onDelete={() => {
                  if (
                    typeof window !== "undefined" &&
                    window.confirm(`Remove admin user “${u.name}”? This cannot be undone.`)
                  ) {
                    remove.mutate(u.id);
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

function AdminUserRow({
  user,
  onSave,
  onDelete,
  busy,
}: {
  user: AdminUser;
  onSave: (body: {
    email: string;
    name: string;
    role: AdminUserRole;
    isActive: boolean;
    password?: string;
  }) => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <tr className="align-top">
      <td className="px-3 py-3 sm:px-4">
        <p className="font-medium text-slate-900">{user.name}</p>
        <p className="text-xs text-slate-600">{user.email}</p>
      </td>
      <td className="px-3 py-3 sm:px-4">
        <RoleBadge role={user.role} />
      </td>
      <td className="px-3 py-3 sm:px-4">
        {user.isActive ? (
          <span className="text-emerald-800 font-medium">Active</span>
        ) : (
          <span className="text-slate-500">Inactive</span>
        )}
      </td>
      <td className="px-3 py-3 text-xs text-slate-600 sm:px-4">
        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
      </td>
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
              const email = String(fd.get("email") ?? "").trim();
              const role = String(fd.get("role") ?? user.role) as AdminUserRole;
              const isActive = fd.get("isActive") === "on";
              const password = String(fd.get("password") ?? "").trim();
              onSave({
                name,
                email,
                role,
                isActive,
                ...(password ? { password } : {}),
              });
              setOpen(false);
            }}
          >
            <label className="block text-xs font-medium text-slate-700">
              Name
              <input className={inputClass} name="name" required defaultValue={user.name} />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Email
              <input className={inputClass} name="email" type="email" required defaultValue={user.email} />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Role
              <select className={inputClass} name="role" defaultValue={user.role}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <input type="checkbox" name="isActive" defaultChecked={user.isActive} className="size-4 rounded" />
              Active (can sign in)
            </label>
            <label className="block text-xs font-medium text-slate-700">
              New password
              <input
                className={inputClass}
                name="password"
                type="password"
                minLength={8}
                autoComplete="new-password"
                placeholder="Leave blank to keep current"
              />
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
