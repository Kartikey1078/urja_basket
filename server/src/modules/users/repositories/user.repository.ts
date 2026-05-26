import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { pool } from "../../../database/pool";
import type { UserProfile, UserRow } from "../user.types";

type UserRowPacket = UserRow & RowDataPacket;

export async function findUserById(id: number): Promise<UserRow | null> {
  const [rows] = await pool.query<UserRowPacket[]>(
    "SELECT * FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] ?? null;
}

export async function findUserByClerkId(clerkId: string): Promise<UserRow | null> {
  const [rows] = await pool.query<UserRowPacket[]>(
    "SELECT * FROM users WHERE clerk_id = ? LIMIT 1",
    [clerkId]
  );
  return rows[0] ?? null;
}

export async function createUserFromClerk(
  clerkId: string,
  profile: UserProfile
): Promise<UserRow> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO users (clerk_id, name, email, phone, image)
     VALUES (?, ?, ?, ?, ?)`,
    [clerkId, profile.name, profile.email, profile.phone, profile.image]
  );

  const created = await findUserByClerkId(clerkId);
  if (!created) {
    throw new Error(`Failed to load user after insert (clerk_id=${clerkId}, id=${result.insertId})`);
  }
  return created;
}

export async function updateUserFromClerk(
  clerkId: string,
  profile: UserProfile
): Promise<UserRow | null> {
  await pool.query(
    `UPDATE users
     SET name = ?, email = ?, phone = ?, image = ?
     WHERE clerk_id = ?`,
    [profile.name, profile.email, profile.phone, profile.image, clerkId]
  );
  return findUserByClerkId(clerkId);
}
