import type { UserRole } from "@/domains/auth/types";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  departmentId: string | null;
  isActive: boolean;
};

export function portalPathForRole(role: UserRole) {
  if (role === "SUPER_ADMIN") {
    return "/admin";
  }
  if (role === "STAFF") {
    return "/staff";
  }
  return "/citizen";
}

export function canAccessCitizenPortal(role: UserRole) {
  return role === "CITIZEN" || role === "SUPER_ADMIN";
}

export function canAccessStaffPortal(role: UserRole) {
  return role === "STAFF" || role === "SUPER_ADMIN";
}

export function canAccessAdminPortal(role: UserRole) {
  return role === "SUPER_ADMIN";
}

export function roleLabel(role: UserRole) {
  if (role === "SUPER_ADMIN") {
    return "Super Admin";
  }
  if (role === "STAFF") {
    return "Staff";
  }
  return "Citizen";
}
