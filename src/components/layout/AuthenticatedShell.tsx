import { ReactNode } from "react";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import type { UserRole } from "@/domains/auth/types";

type AuthenticatedShellProps = {
  children: ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role: UserRole;
  };
};

export function AuthenticatedShell({
  children,
  user,
}: AuthenticatedShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <SkipLink />
      <AuthHeader user={user} />
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
