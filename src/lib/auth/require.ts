import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { AuthUser } from "@/lib/rbac";
import {
  canAccessAdminPortal,
  canAccessCitizenPortal,
  canAccessDepartmentAdminPortal,
  canAccessWorkerPortal,
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

export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  const user = sessionToAuthUser(session);
  if (!user.isActive) {
    return null;
  }
  return user;
});

export const requireAuth = cache(async (): Promise<AuthUser> => {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }
  return user;
});

export const requireRole = cache(
  async (...roles: UserRole[]): Promise<AuthUser> => {
    const user = await requireAuth();
    if (!roles.includes(user.role)) {
      redirect(portalPathForRole(user.role));
    }
    return user;
  },
);

export const requireCitizen = cache(async (): Promise<AuthUser> => {
  const user = await requireAuth();
  if (!canAccessCitizenPortal(user.role)) {
    redirect(portalPathForRole(user.role));
  }
  return user;
});

export const requireWorker = cache(async (): Promise<AuthUser> => {
  const user = await requireAuth();
  if (!canAccessWorkerPortal(user.role)) {
    redirect(portalPathForRole(user.role));
  }
  return user;
});

export const requireDepartmentAdmin = cache(async (): Promise<AuthUser> => {
  const user = await requireAuth();
  if (!canAccessDepartmentAdminPortal(user.role)) {
    redirect(portalPathForRole(user.role));
  }
  return user;
});

export const requireSuperAdmin = cache(async (): Promise<AuthUser> => {
  const user = await requireAuth();
  if (!canAccessAdminPortal(user.role)) {
    redirect(portalPathForRole(user.role));
  }
  return user;
});

/** @deprecated use requireCitizen */
export async function requireCitizenPortal(): Promise<AuthUser> {
  return requireCitizen();
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

export async function requireCitizenApi(): Promise<
  { user: AuthUser } | { response: Response }
> {
  const gate = await requireAuthApi();
  if ("response" in gate) {
    return gate;
  }
  if (!canAccessCitizenPortal(gate.user.role)) {
    return {
      response: jsonError(
        API_ERROR_CODES.FORBIDDEN,
        "Citizen access is required.",
        403,
      ),
    };
  }
  return gate;
}

/** @deprecated use requireCitizenApi */
export async function requireCitizenPortalApi(): Promise<
  { user: AuthUser } | { response: Response }
> {
  return requireCitizenApi();
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
