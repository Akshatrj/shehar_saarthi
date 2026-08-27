import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { authorizeCredentials } from "@/domains/auth/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      id: "credentials",
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: authorizeCredentials,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials") {
        if (!user.email) {
          return false;
        }
        if (user.isActive === false) {
          return "/login?error=inactive";
        }
        return true;
      }

      if (account?.provider !== "google" || !user.email) {
        return false;
      }

      const googleProfile = profile as { email_verified?: boolean } | undefined;
      if (googleProfile?.email_verified === false) {
        return false;
      }

      const { syncGoogleUser } = await import("@/domains/auth/sync-user");
      try {
        const synced = await syncGoogleUser({
          email: user.email,
          name: user.name,
          image: user.image,
        });

        if (!synced.isActive) {
          return "/login?error=inactive";
        }
      } catch {
        return "/login?error=database";
      }

      return true;
    },
    async jwt({ token, user, account }) {
      try {
        const { syncGoogleUser, loadUserById, loadUserByEmail } = await import(
          "@/domains/auth/sync-user"
        );

        if (account?.provider === "credentials" && user?.id) {
          token.sub = user.id;
          token.userId = user.id;
          token.email = user.email;
          token.role = user.role ?? "CITIZEN";
          token.departmentId = user.departmentId ?? null;
          token.isActive = user.isActive !== false;
          return token;
        }

        if (account?.provider === "google" && user?.email) {
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

        const userId =
          typeof token.userId === "string"
            ? token.userId
            : typeof token.sub === "string"
              ? token.sub
              : null;

        if (userId) {
          const synced = await loadUserById(userId);
          if (synced) {
            token.userId = synced.id;
            token.sub = synced.id;
            token.email = synced.email;
            token.role = synced.role;
            token.departmentId = synced.departmentId;
            token.isActive = synced.isActive;
          }
          return token;
        }

        if (typeof token.email === "string") {
          const synced = await loadUserByEmail(token.email);
          if (synced) {
            token.userId = synced.id;
            token.sub = synced.id;
            token.role = synced.role;
            token.departmentId = synced.departmentId;
            token.isActive = synced.isActive;
          }
        }
      } catch (error) {
        console.error("[auth] jwt user lookup failed; keeping existing token");
        if (user?.email) {
          throw error;
        }
      }

      return token;
    },
  },
});
