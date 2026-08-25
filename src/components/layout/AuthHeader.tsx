"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import type { UserRole } from "@/domains/auth/types";
import {
  canAccessAdminPortal,
  canAccessCitizenPortal,
  canAccessDepartmentAdminPortal,
  canAccessWorkerPortal,
  portalPathForRole,
  roleLabel,
} from "@/lib/rbac";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { NavbarFrame } from "@/components/layout/NavbarFrame";
import { NavLinks } from "@/components/layout/NavLinks";

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
    links.push({ href: "/citizen", label: "My complaints" });
    links.push({ href: "/citizen/report", label: "Report issue" });
  }
  if (canAccessWorkerPortal(role)) {
    links.push({ href: "/worker", label: "Worker desk" });
  }
  if (canAccessDepartmentAdminPortal(role)) {
    links.push({ href: "/department-admin", label: "Department admin" });
  }
  if (canAccessAdminPortal(role)) {
    links.push({ href: "/admin", label: "Admin" });
  }
  return links;
}

const citizenNavItems = [
  { href: "/citizen", label: "My complaints" },
  { href: "/citizen/report", label: "Report issue" },
];

export function AuthHeader({ user }: AuthHeaderProps) {
  const links = portalLinksForRole(user.role);
  const navItems = canAccessCitizenPortal(user.role) ? citizenNavItems : links;

  return (
    <NavbarFrame>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2.5">
        <Logo compact href={portalPathForRole(user.role)} />
        <nav
          aria-label="Portals"
          className="hidden min-w-0 flex-1 justify-center lg:flex"
        >
          <div className="flex items-center gap-1">
            <NavLinks items={navItems} />
          </div>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right text-small leading-tight sm:block">
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
        <div className="flex w-full flex-wrap gap-1 lg:hidden">
          {navItems.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center rounded-md px-3 text-small font-medium text-muted hover:bg-brand-50 hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </NavbarFrame>
  );
}
