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
  if (role === "DEPARTMENT_ADMIN") {
    return "/department-admin";
  }
  if (role === "WORKER") {
    return "/worker";
  }
  return "/citizen";
}

export function canAccessCitizenPortal(role: UserRole) {
  return role === "CITIZEN";
}

export function canAccessWorkerPortal(role: UserRole) {
  return role === "WORKER";
}

export function canAccessDepartmentAdminPortal(role: UserRole) {
  return role === "DEPARTMENT_ADMIN";
}

export function canAccessAdminPortal(role: UserRole) {
  return role === "SUPER_ADMIN";
}

export function roleLabel(role: UserRole) {
  if (role === "SUPER_ADMIN") {
    return "Super Admin";
  }
  if (role === "DEPARTMENT_ADMIN") {
    return "Department Admin";
  }
  if (role === "WORKER") {
    return "Worker";
  }
  return "Citizen";
}

export function roleRequiresDepartment(role: UserRole) {
  return role === "WORKER" || role === "DEPARTMENT_ADMIN";
}

export function validateRoleDepartmentRules(
  role: UserRole,
  departmentId: string | null,
) {
  if (roleRequiresDepartment(role) && !departmentId) {
    return "A department is required for this role.";
  }
  if (
    (role === "CITIZEN" || role === "SUPER_ADMIN") &&
    departmentId !== null
  ) {
    return "This role cannot be linked to a department.";
  }
  return null;
}
