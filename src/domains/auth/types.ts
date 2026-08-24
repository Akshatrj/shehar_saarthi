export const USER_ROLES = ["CITIZEN", "STAFF", "SUPER_ADMIN"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type SessionUser = {
  id: string;
  role: UserRole;
  name?: string | null;
  email?: string | null;
  departmentId?: string | null;
  isActive: boolean;
};
