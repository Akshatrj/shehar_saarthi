import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) {
        return false;
      }

      const { syncGoogleUser } = await import("@/domains/auth/sync-user");
      const synced = await syncGoogleUser({
        email: user.email,
        name: user.name,
        image: user.image,
      });

      if (!synced.isActive) {
        return "/login?error=inactive";
      }

      return true;
    },
    async jwt({ token, user }) {
      const { syncGoogleUser, loadUserByEmail } = await import(
        "@/domains/auth/sync-user"
      );

      if (user?.email) {
        const synced = await syncGoogleUser({
          email: user.email,
          name: user.name,
          image: user.image,
        });
        token.sub = synced.id;
        token.userId = synced.id;
        token.email = user.email;
        token.role = synced.role;
        token.departmentId = synced.departmentId;
        token.isActive = synced.isActive;
        return token;
      }

      if (typeof token.email === "string") {
        const synced = await loadUserByEmail(token.email);
        if (!synced) {
          return token;
        }
        token.userId = synced.id;
        token.role = synced.role;
        token.departmentId = synced.departmentId;
        token.isActive = synced.isActive;
      }

      return token;
    },
  },
});
