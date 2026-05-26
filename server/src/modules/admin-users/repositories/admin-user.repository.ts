import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { pool } from "../../../database/pool";
import type { AdminUser, AdminUserRole } from "../admin-user.types";

type AdminUserRow = RowDataPacket & {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  role: AdminUserRole;
  is_active: number;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

function rowToAdminUser(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    isActive: Boolean(row.is_active),
    lastLoginAt: row.last_login_at ? row.last_login_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

const SELECT_FIELDS = `id, email, name, password_hash, role, is_active, last_login_at, created_at, updated_at`;

export async function findAllAdminUsers(): Promise<AdminUser[]> {
  const [rows] = await pool.query<AdminUserRow[]>(
    `SELECT ${SELECT_FIELDS} FROM admin_users ORDER BY name ASC`
  );
  return rows.map(rowToAdminUser);
}

export async function findAdminUserById(id: number): Promise<(AdminUser & { passwordHash: string }) | null> {
  const [rows] = await pool.query<AdminUserRow[]>(
    `SELECT ${SELECT_FIELDS} FROM admin_users WHERE id = ? LIMIT 1`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;
  return { ...rowToAdminUser(row), passwordHash: row.password_hash };
}

export async function findAdminUserByEmail(
  email: string
): Promise<(AdminUser & { passwordHash: string }) | null> {
  const [rows] = await pool.query<AdminUserRow[]>(
    `SELECT ${SELECT_FIELDS} FROM admin_users WHERE email = ? LIMIT 1`,
    [email]
  );
  const row = rows[0];
  if (!row) return null;
  return { ...rowToAdminUser(row), passwordHash: row.password_hash };
}

export async function countActiveOwners(excludeId?: number): Promise<number> {
  const params: number[] = [];
  let sql = `SELECT COUNT(*) AS c FROM admin_users WHERE role = 'owner' AND is_active = 1`;
  if (excludeId != null) {
    sql += ` AND id <> ?`;
    params.push(excludeId);
  }
  const [rows] = await pool.query<(RowDataPacket & { c: number })[]>(sql, params);
  return Number(rows[0]?.c ?? 0);
}

export async function insertAdminUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  role: AdminUserRole;
}): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO admin_users (email, name, password_hash, role, is_active)
     VALUES (?, ?, ?, ?, 1)`,
    [input.email, input.name, input.passwordHash, input.role]
  );
  return result.insertId;
}

export async function updateAdminUser(
  id: number,
  patch: {
    email?: string;
    name?: string;
    passwordHash?: string;
    role?: AdminUserRole;
    isActive?: boolean;
  }
): Promise<boolean> {
  const sets: string[] = [];
  const params: unknown[] = [];

  if (patch.email !== undefined) {
    sets.push("email = ?");
    params.push(patch.email);
  }
  if (patch.name !== undefined) {
    sets.push("name = ?");
    params.push(patch.name);
  }
  if (patch.passwordHash !== undefined) {
    sets.push("password_hash = ?");
    params.push(patch.passwordHash);
  }
  if (patch.role !== undefined) {
    sets.push("role = ?");
    params.push(patch.role);
  }
  if (patch.isActive !== undefined) {
    sets.push("is_active = ?");
    params.push(patch.isActive ? 1 : 0);
  }

  if (sets.length === 0) return true;

  params.push(id);
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE admin_users SET ${sets.join(", ")} WHERE id = ?`,
    params
  );
  return result.affectedRows > 0;
}

export async function deleteAdminUser(id: number): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(`DELETE FROM admin_users WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

export async function touchAdminUserLogin(id: number): Promise<void> {
  await pool.query(`UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?`, [id]);
}
