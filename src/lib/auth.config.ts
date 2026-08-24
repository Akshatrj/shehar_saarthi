import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { mapAuthSession } from "@/lib/auth-session";
import {
  googleClientId,
  googleClientSecret,
} from "@/lib/auth-env";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: googleClientId(),
      clientSecret: googleClientSecret(),
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      return mapAuthSession({ session, token });
    },
  },
} satisfies NextAuthConfig;
