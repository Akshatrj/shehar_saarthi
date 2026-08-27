import {
  canAccessAdminPortal,
  canAccessCitizenPortal,
  canAccessDepartmentAdminPortal,
  canAccessWorkerPortal,
  portalPathForRole,
} from "@/lib/rbac";
import type { UserRole } from "@/domains/auth/types";

export function safeAuthCallbackUrl(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/citizen";
  }
  return value;
}

function canAccessPath(role: UserRole, path: string) {
  if (path === "/citizen" || path.startsWith("/citizen/")) {
    return canAccessCitizenPortal(role);
  }
  if (path === "/worker" || path.startsWith("/worker/")) {
    return canAccessWorkerPortal(role);
  }
  if (path === "/department-admin" || path.startsWith("/department-admin/")) {
    return canAccessDepartmentAdminPortal(role);
  }
  if (path === "/admin" || path.startsWith("/admin/")) {
    return canAccessAdminPortal(role);
  }
  return true;
}

export function postLoginPath(
  callbackUrl: string | undefined,
  role: UserRole,
) {
  const dest = safeAuthCallbackUrl(callbackUrl);
  if (canAccessPath(role, dest)) {
    return dest;
  }
  return portalPathForRole(role);
}

export function loginDeskHint(callbackUrl: string) {
  if (callbackUrl.startsWith("/admin")) {
    return "Super admin desk";
  }
  if (callbackUrl.startsWith("/department-admin")) {
    return "Department admin desk";
  }
  if (callbackUrl.startsWith("/worker") || callbackUrl.startsWith("/staff")) {
    return "Field worker desk";
  }
  return null;
}
