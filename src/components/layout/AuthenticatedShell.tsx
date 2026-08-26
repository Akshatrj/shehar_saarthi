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
    <div className="flex min-h-dvh min-w-0 flex-col bg-paper">
      <SkipLink />
      <AuthHeader user={user} />
      <main id="main-content" className="ss-container min-w-0 flex-1 py-5 sm:py-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}
