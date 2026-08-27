"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { portalPathForRole } from "@/lib/rbac";
import type { UserRole } from "@/domains/auth/types";

type MeResponse = {
  role?: UserRole;
};

export function PublicNavActions() {
  const { data: session, status } = useSession();
  const [portalHref, setPortalHref] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      setPortalHref(null);
      return;
    }

    let cancelled = false;

    fetch("/api/v1/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: MeResponse | null) => {
        if (cancelled) {
          return;
        }
        const role = payload?.role ?? (session.user.role as UserRole);
        setPortalHref(portalPathForRole(role));
      })
      .catch(() => {
        if (!cancelled) {
          setPortalHref(portalPathForRole(session.user.role as UserRole));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, session?.user?.role, status]);

  if (status === "loading") {
    return (
      <span className="inline-block h-11 w-20 animate-pulse rounded-md bg-line/70" />
    );
  }

  if (session?.user?.id) {
    const href = portalHref ?? portalPathForRole(session.user.role as UserRole);

    return (
      <>
        <Link
          href={href}
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
