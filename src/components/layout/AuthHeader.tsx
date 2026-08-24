"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import type { UserRole } from "@/domains/auth/types";
import {
  canAccessAdminPortal,
  canAccessCitizenPortal,
  canAccessStaffPortal,
  roleLabel,
} from "@/lib/rbac";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";

type AuthHeaderProps = {
  user: {
    name?: string | null;
    email?: string | null;
    role: UserRole;
  };
};

function portalLinksForRole(role: UserRole) {
  const links: { href: string; label: string }[] = [];
  if (canAccessCitizenPortal(role)) {
    links.push({ href: "/citizen", label: "Citizen" });
  }
  if (canAccessStaffPortal(role)) {
    links.push({ href: "/staff", label: "Staff" });
  }
  if (canAccessAdminPortal(role)) {
    links.push({ href: "/admin", label: "Admin" });
  }
  return links;
}

export function AuthHeader({ user }: AuthHeaderProps) {
  const links = portalLinksForRole(user.role);

  return (
    <header className="border-b border-line bg-paper-raised">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Logo compact />
        <nav
          aria-label="Portals"
          className="flex flex-1 flex-wrap items-center gap-1"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center rounded-md px-3 text-small font-medium text-muted hover:bg-brand-50 hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="text-right text-small leading-tight">
            <p className="font-medium text-navy">{user.name ?? user.email}</p>
            <p className="text-muted">{roleLabel(user.role)}</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
