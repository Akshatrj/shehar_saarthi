import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { AuthUser } from "@/lib/rbac";
import {
  canAccessAdminPortal,
  canAccessCitizenPortal,
  canAccessStaffPortal,
  portalPathForRole,
} from "@/lib/rbac";
import type { UserRole } from "@/domains/auth/types";
import { API_ERROR_CODES } from "@/lib/api/errors";
import { jsonError } from "@/lib/api/response";

function sessionToAuthUser(session: {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    role: UserRole;
    departmentId?: string | null;
    isActive?: boolean;
  };
}): AuthUser {
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
    role: session.user.role,
    departmentId: session.user.departmentId ?? null,
    isActive: session.user.isActive !== false,
  };
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  const user = sessionToAuthUser(session);
  if (!user.isActive) {
    return null;
  }
  return user;
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(...roles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    redirect(portalPathForRole(user.role));
  }
  return user;
}

export async function requireStaff(): Promise<AuthUser> {
  const user = await requireAuth();
  if (!canAccessStaffPortal(user.role)) {
    redirect(portalPathForRole(user.role));
  }
  return user;
}

export async function requireSuperAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (!canAccessAdminPortal(user.role)) {
    redirect(portalPathForRole(user.role));
  }
  return user;
}

export async function requireCitizenPortal(): Promise<AuthUser> {
  const user = await requireAuth();
  if (!canAccessCitizenPortal(user.role)) {
    redirect(portalPathForRole(user.role));
  }
  return user;
}

export async function requireAuthApi(): Promise<
  { user: AuthUser } | { response: Response }
> {
  const user = await getAuthUser();
  if (!user) {
    return {
      response: jsonError(
        API_ERROR_CODES.UNAUTHORIZED,
        "Please sign in to continue.",
        401,
      ),
    };
  }
  return { user };
}

export async function requireRoleApi(
  ...roles: UserRole[]
): Promise<{ user: AuthUser } | { response: Response }> {
  const gate = await requireAuthApi();
  if ("response" in gate) {
    return gate;
  }
  if (!roles.includes(gate.user.role)) {
    return {
      response: jsonError(
        API_ERROR_CODES.FORBIDDEN,
        "You do not have permission to perform this action.",
        403,
      ),
    };
  }
  return gate;
}

export async function requireStaffApi(): Promise<
  { user: AuthUser } | { response: Response }
> {
  const gate = await requireAuthApi();
  if ("response" in gate) {
    return gate;
  }
  if (!canAccessStaffPortal(gate.user.role)) {
    return {
      response: jsonError(
        API_ERROR_CODES.FORBIDDEN,
        "Staff access is required.",
        403,
      ),
    };
  }
  return gate;
}

export async function requireSuperAdminApi(): Promise<
  { user: AuthUser } | { response: Response }
> {
  const gate = await requireAuthApi();
  if ("response" in gate) {
    return gate;
  }
  if (!canAccessAdminPortal(gate.user.role)) {
    return {
      response: jsonError(
        API_ERROR_CODES.FORBIDDEN,
        "Super admin access is required.",
        403,
      ),
    };
  }
  return gate;
}
