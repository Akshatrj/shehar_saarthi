"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/components/layout/Navbar";

function itemPath(href: string) {
  return href.split("#")[0] || "/";
}

function isActive(pathname: string, href: string) {
  const path = itemPath(href);
  if (path === "/") {
    return pathname === "/";
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center px-2.5 text-small font-medium text-ink transition-colors duration-150 hover:text-brand",
              active && "text-brand shadow-[inset_0_-2px_0_0_currentColor]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
