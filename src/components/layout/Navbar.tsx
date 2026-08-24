import { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/layout/Logo";
import { NavLinks } from "@/components/layout/NavLinks";
import { MobileNav } from "@/components/layout/MobileNav";

export type NavItem = {
  href: string;
  label: string;
};

type NavbarProps = {
  items?: NavItem[];
  actions?: ReactNode;
  compactLogo?: boolean;
};

export function Navbar({
  items = [],
  actions,
  compactLogo = true,
}: NavbarProps) {
  const hasItems = items.length > 0;

  return (
    <header className="relative sticky top-0 z-40 border-b border-line/80 bg-paper-raised/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
        <Logo compact={compactLogo} />
        {hasItems ? (
          <nav
            aria-label="Primary"
            className="hidden min-w-0 flex-1 justify-center lg:flex"
          >
            <div className="flex items-center gap-1">
              <NavLinks items={items} />
            </div>
          </nav>
        ) : (
          <div className="min-w-0 flex-1" />
        )}
        <div
          className={cn(
            "flex shrink-0 items-center justify-end gap-1 sm:gap-2",
            hasItems ? "ml-auto lg:ml-0" : "",
          )}
        >
          {actions}
          {hasItems ? (
            <MobileNav
              items={items}
              accountItem={{ href: "/login", label: "Sign in" }}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}
