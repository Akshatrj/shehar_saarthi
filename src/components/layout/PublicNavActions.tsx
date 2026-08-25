"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { portalPathForRole } from "@/lib/rbac";
import type { UserRole } from "@/domains/auth/types";

export function PublicNavActions() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="inline-block h-11 w-20 animate-pulse rounded-md bg-line/70" />
    );
  }

  if (session?.user?.id) {
    const role = session.user.role as UserRole;
    const portalHref = portalPathForRole(role);

    return (
      <>
        <Link
          href={portalHref}
          className="hidden max-w-[10rem] truncate text-small font-medium text-navy hover:text-brand sm:inline"
        >
          {session.user.name ?? session.user.email}
        </Link>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign out
        </Button>
      </>
    );
  }

  return (
    <ButtonLink href="/login" size="sm">
      Sign in
    </ButtonLink>
  );
}
