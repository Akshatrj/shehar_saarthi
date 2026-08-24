import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

function googleClientId() {
  return (
    process.env.AUTH_GOOGLE_ID?.trim() ||
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    ""
  );
}

function googleClientSecret() {
  return (
    process.env.AUTH_GOOGLE_SECRET?.trim() ||
    process.env.GOOGLE_CLIENT_SECRET?.trim() ||
    ""
  );
}

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: googleClientId(),
      clientSecret: googleClientSecret(),
    }),
  ],
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
