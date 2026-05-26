import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { pool } from "../../../database/pool";
import type { AddressInput, UserAddressRow } from "../address.types";

type AddressRowPacket = UserAddressRow & RowDataPacket;

export async function listAddressesByUserId(userId: number): Promise<UserAddressRow[]> {
  const [rows] = await pool.query<AddressRowPacket[]>(
    `SELECT * FROM user_addresses
     WHERE user_id = ?
     ORDER BY is_default DESC, updated_at DESC`,
    [userId]
  );
  return rows;
}

export async function findAddressById(
  id: number,
  userId: number
): Promise<UserAddressRow | null> {
  const [rows] = await pool.query<AddressRowPacket[]>(
    "SELECT * FROM user_addresses WHERE id = ? AND user_id = ? LIMIT 1",
    [id, userId]
  );
  return rows[0] ?? null;
}

export async function clearDefaultForUser(userId: number): Promise<void> {
  await pool.query("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?", [userId]);
}

export async function insertAddress(
  userId: number,
  input: AddressInput,
  lines: { line1: string; line2: string | null }
): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO user_addresses (
      user_id, full_name, phone_number, alternate_phone,
      address_line_1, address_line_2, landmark,
      city, state, country, postal_code,
      latitude, longitude, address_type, is_default
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      input.fullName,
      input.phoneNumber,
      input.alternatePhone ?? null,
      lines.line1,
      lines.line2,
      input.landmark ?? null,
      input.city,
      input.state,
      input.country ?? "India",
      input.postalCode,
      input.latitude ?? null,
      input.longitude ?? null,
      input.addressType ?? "home",
      input.isDefault ? 1 : 0,
    ]
  );
  return result.insertId;
}

export async function updateAddress(
  id: number,
  userId: number,
  input: AddressInput,
  lines: { line1: string; line2: string | null }
): Promise<void> {
  await pool.query(
    `UPDATE user_addresses SET
      full_name = ?, phone_number = ?, alternate_phone = ?,
      address_line_1 = ?, address_line_2 = ?, landmark = ?,
      city = ?, state = ?, country = ?, postal_code = ?,
      latitude = ?, longitude = ?, address_type = ?, is_default = ?
     WHERE id = ? AND user_id = ?`,
    [
      input.fullName,
      input.phoneNumber,
      input.alternatePhone ?? null,
      lines.line1,
      lines.line2,
      input.landmark ?? null,
      input.city,
      input.state,
      input.country ?? "India",
      input.postalCode,
      input.latitude ?? null,
      input.longitude ?? null,
      input.addressType ?? "home",
      input.isDefault ? 1 : 0,
      id,
      userId,
    ]
  );
}

export async function deleteAddress(id: number, userId: number): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    "DELETE FROM user_addresses WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  return result.affectedRows > 0;
}

export async function setDefaultAddress(id: number, userId: number): Promise<boolean> {
  const existing = await findAddressById(id, userId);
  if (!existing) return false;
  await clearDefaultForUser(userId);
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  return result.affectedRows > 0;
}
