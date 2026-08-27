import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Edge-safe: authentication only. Role/department authorization is enforced in
// server layouts and API helpers via getAuthUser(), which reads Prisma.
const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;
  const signedIn = Boolean(session?.user?.id);

  if (!signedIn) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
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
