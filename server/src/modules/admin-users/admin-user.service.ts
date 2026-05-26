import { HttpError } from "../../errors/httpError";
import { hashPassword, verifyPassword } from "../../lib/password";
import type {
  AdminUser,
  AdminUserCreateInput,
  AdminUserRole,
  AdminUserUpdateInput,
} from "./admin-user.types";
import * as adminUserRepo from "./repositories/admin-user.repository";

const ROLES: AdminUserRole[] = ["owner", "manager", "staff"];
const MIN_PASSWORD_LEN = 8;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function assertRole(role: unknown): AdminUserRole {
  if (typeof role !== "string" || !ROLES.includes(role as AdminUserRole)) {
    throw new HttpError(400, `role must be one of: ${ROLES.join(", ")}`);
  }
  return role as AdminUserRole;
}

function assertPassword(password: string, label = "password"): void {
  if (password.length < MIN_PASSWORD_LEN) {
    throw new HttpError(400, `${label} must be at least ${MIN_PASSWORD_LEN} characters`);
  }
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  try {
    return await adminUserRepo.findAllAdminUsers();
  } catch (err) {
    const code = typeof err === "object" && err !== null ? (err as { code?: string }).code : undefined;
    if (code === "ER_NO_SUCH_TABLE") {
      throw new HttpError(503, "Admin users table missing. Run npm run db:migrate in server/");
    }
    throw err;
  }
}

export async function createAdminUser(input: AdminUserCreateInput): Promise<AdminUser> {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  if (!email || !email.includes("@")) {
    throw new HttpError(400, "Valid email is required");
  }
  if (!name) throw new HttpError(400, "name is required");
  assertPassword(input.password);
  const role = assertRole(input.role);

  const existing = await adminUserRepo.findAdminUserByEmail(email);
  if (existing) throw new HttpError(409, "Email already in use");

  const passwordHash = await hashPassword(input.password);
  try {
    const id = await adminUserRepo.insertAdminUser({ email, name, passwordHash, role });
    const created = await adminUserRepo.findAdminUserById(id);
    if (!created) throw new HttpError(500, "Failed to load created user");
    const { passwordHash: _, ...user } = created;
    return user;
  } catch (err) {
    const errno = typeof err === "object" && err !== null ? (err as { errno?: number }).errno : undefined;
    if (errno === 1062) throw new HttpError(409, "Email already in use");
    throw err;
  }
}

export async function updateAdminUser(id: number, input: AdminUserUpdateInput): Promise<AdminUser> {
  const current = await adminUserRepo.findAdminUserById(id);
  if (!current) throw new HttpError(404, "Admin user not found");

  const patch: {
    email?: string;
    name?: string;
    passwordHash?: string;
    role?: AdminUserRole;
    isActive?: boolean;
  } = {};

  if (input.email !== undefined) {
    const email = normalizeEmail(input.email);
    if (!email || !email.includes("@")) throw new HttpError(400, "Valid email is required");
    if (email !== current.email) {
      const taken = await adminUserRepo.findAdminUserByEmail(email);
      if (taken && taken.id !== id) throw new HttpError(409, "Email already in use");
    }
    patch.email = email;
  }
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new HttpError(400, "name is required");
    patch.name = name;
  }
  if (input.password !== undefined) {
    assertPassword(input.password, "password");
    patch.passwordHash = await hashPassword(input.password);
  }
  if (input.role !== undefined) patch.role = assertRole(input.role);
  if (input.isActive !== undefined) patch.isActive = input.isActive;

  const nextRole = patch.role ?? current.role;
  const nextActive = patch.isActive ?? current.isActive;

  if (current.role === "owner" && nextRole !== "owner" && current.isActive) {
    const owners = await adminUserRepo.countActiveOwners(id);
    if (owners === 0) {
      throw new HttpError(400, "Cannot change role: at least one active owner is required");
    }
  }
  if (current.role === "owner" && nextActive === false && current.isActive) {
    const owners = await adminUserRepo.countActiveOwners(id);
    if (owners === 0) {
      throw new HttpError(400, "Cannot deactivate the last active owner");
    }
  }

  if (Object.keys(patch).length === 0) {
    const { passwordHash: _, ...user } = current;
    return user;
  }

  const ok = await adminUserRepo.updateAdminUser(id, patch);
  if (!ok) throw new HttpError(404, "Admin user not found");

  const updated = await adminUserRepo.findAdminUserById(id);
  if (!updated) throw new HttpError(500, "Failed to load updated user");
  const { passwordHash: _, ...user } = updated;
  return user;
}

export async function deleteAdminUser(id: number): Promise<void> {
  const current = await adminUserRepo.findAdminUserById(id);
  if (!current) throw new HttpError(404, "Admin user not found");

  if (current.role === "owner" && current.isActive) {
    const owners = await adminUserRepo.countActiveOwners(id);
    if (owners === 0) {
      throw new HttpError(400, "Cannot delete the last active owner");
    }
  }

  const ok = await adminUserRepo.deleteAdminUser(id);
  if (!ok) throw new HttpError(404, "Admin user not found");
}

export async function authenticateAdminUser(
  email: string,
  password: string
): Promise<AdminUser | null> {
  const normalized = normalizeEmail(email);
  if (!normalized || !password) return null;

  let user: Awaited<ReturnType<typeof adminUserRepo.findAdminUserByEmail>>;
  try {
    user = await adminUserRepo.findAdminUserByEmail(normalized);
  } catch (err) {
    const code = typeof err === "object" && err !== null ? (err as { code?: string }).code : undefined;
    if (code === "ER_NO_SUCH_TABLE") return null;
    throw err;
  }

  if (!user || !user.isActive) return null;
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  await adminUserRepo.touchAdminUserLogin(user.id);
  const { passwordHash: _, ...safe } = user;
  return { ...safe, lastLoginAt: new Date().toISOString() };
}

export function parseCreateBody(body: Record<string, unknown>): AdminUserCreateInput {
  if (typeof body.email !== "string" || typeof body.name !== "string" || typeof body.password !== "string") {
    throw new HttpError(400, "email, name, and password are required");
  }
  return {
    email: body.email,
    name: body.name,
    password: body.password,
    role: body.role !== undefined ? assertRole(body.role) : "staff",
  };
}

export function parseUpdateBody(body: Record<string, unknown>): AdminUserUpdateInput {
  const patch: AdminUserUpdateInput = {};
  if (body.email !== undefined) patch.email = String(body.email);
  if (body.name !== undefined) patch.name = String(body.name);
  if (body.password !== undefined) {
    if (body.password === "" || body.password === null) {
      /* skip empty password */
    } else {
      patch.password = String(body.password);
    }
  }
  if (body.role !== undefined) patch.role = assertRole(body.role);
  if (body.isActive !== undefined) patch.isActive = Boolean(body.isActive);
  if (Object.keys(patch).length === 0) {
    throw new HttpError(400, "No valid fields to update");
  }
  return patch;
}
