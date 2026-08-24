import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import {
  canAccessAdminPortal,
  canAccessCitizenPortal,
  canAccessDepartmentAdminPortal,
  canAccessWorkerPortal,
  portalPathForRole,
} from "@/lib/rbac";
import type { UserRole } from "@/domains/auth/types";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;
  const signedIn = Boolean(session?.user?.id);
  const isActive = session?.user?.isActive !== false;
  const role = session?.user?.role as UserRole | undefined;

  if (!signedIn || !isActive) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    if (!isActive && signedIn) {
      loginUrl.searchParams.set("error", "inactive");
    } else {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return Response.redirect(loginUrl);
  }

  if (pathname.startsWith("/citizen") && role && !canAccessCitizenPortal(role)) {
    return Response.redirect(
      new URL(portalPathForRole(role), request.nextUrl.origin),
    );
  }

  if (pathname.startsWith("/worker") && role && !canAccessWorkerPortal(role)) {
    return Response.redirect(
      new URL(portalPathForRole(role), request.nextUrl.origin),
    );
  }

  if (
    pathname.startsWith("/department-admin") &&
    role &&
    !canAccessDepartmentAdminPortal(role)
  ) {
    return Response.redirect(
      new URL(portalPathForRole(role), request.nextUrl.origin),
    );
  }

  if (pathname.startsWith("/admin") && role && !canAccessAdminPortal(role)) {
    return Response.redirect(
      new URL(portalPathForRole(role), request.nextUrl.origin),
    );
  }

  if (pathname.startsWith("/staff")) {
    const target = pathname.replace(/^\/staff/, "/worker");
    return Response.redirect(new URL(target, request.nextUrl.origin));
  }
});

export const config = {
  matcher: [
    "/citizen/:path*",
    "/worker/:path*",
    "/department-admin/:path*",
    "/admin/:path*",
    "/staff/:path*",
  ],
};
