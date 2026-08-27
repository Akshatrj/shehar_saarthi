"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { isNavItemActive } from "@/lib/nav-active";
import type { NavItem } from "@/components/layout/Navbar";

type MobileNavProps = {
  items: NavItem[];
  accountItem?: NavItem;
};

export function MobileNav({ items, accountItem }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-navy hover:bg-brand-50"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? (
          <X className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        )}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>
      {open ? (
        <div
          id={panelId}
          className="absolute inset-x-0 top-full z-40 max-h-[min(80dvh,calc(100dvh-4rem))] overflow-y-auto border-b border-line bg-paper-raised pb-[env(safe-area-inset-bottom,0px)]"
        >
          <nav
            aria-label="Primary"
            className="ss-container flex flex-col py-2"
          >
            {items.map((item) => {
              const active = isNavItemActive(items, pathname, item.href);
              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-md px-3 text-small font-medium",
                    active
                      ? "bg-brand-50 text-brand-dark"
                      : "text-navy hover:bg-brand-50",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {accountItem ? (
              <Link
                href={accountItem.href}
                className="inline-flex min-h-11 items-center rounded-md px-3 text-small font-medium text-navy hover:bg-brand-50 sm:hidden"
              >
                {accountItem.label}
              </Link>
            ) : null}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
