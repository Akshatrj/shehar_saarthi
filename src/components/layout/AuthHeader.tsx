"use client";

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
import { MobileNav } from "@/components/layout/MobileNav";
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
      <div className="ss-container flex items-center gap-2 py-2.5 sm:gap-3">
        <Logo compact href={portalPathForRole(user.role)} className="min-w-0 shrink" />
        <nav
          aria-label="Portals"
          className="hidden min-w-0 flex-1 justify-center lg:flex"
        >
          <div className="flex items-center gap-1">
            <NavLinks items={navItems} />
          </div>
        </nav>
        <div className="ml-auto flex shrink-0 items-center justify-end gap-1 sm:gap-2">
          <div className="hidden min-w-0 text-right text-small leading-tight md:block">
            <p className="truncate font-medium text-navy">{user.name ?? user.email}</p>
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
          <MobileNav items={navItems} />
        </div>
      </div>
    </NavbarFrame>
  );
}
