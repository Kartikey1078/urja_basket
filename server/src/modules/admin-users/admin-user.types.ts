export type AdminUserRole = "owner" | "manager" | "staff";

export type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: AdminUserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserCreateInput = {
  email: string;
  name: string;
  password: string;
  role: AdminUserRole;
};

export type AdminUserUpdateInput = {
  email?: string;
  name?: string;
  password?: string;
  role?: AdminUserRole;
  isActive?: boolean;
};
