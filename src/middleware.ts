import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import {
  canAccessAdminPortal,
  canAccessCitizenPortal,
  canAccessStaffPortal,
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

  if (pathname.startsWith("/staff") && role && !canAccessStaffPortal(role)) {
    return Response.redirect(
      new URL(portalPathForRole(role), request.nextUrl.origin),
    );
  }

  if (pathname.startsWith("/admin") && role && !canAccessAdminPortal(role)) {
    return Response.redirect(
      new URL(portalPathForRole(role), request.nextUrl.origin),
    );
  }
});

export const config = {
  matcher: ["/citizen/:path*", "/staff/:path*", "/admin/:path*"],
};
