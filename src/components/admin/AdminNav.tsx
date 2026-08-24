import Link from "next/link";
import { cn } from "@/lib/cn";

const links = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/departments", label: "Departments" },
  { href: "/admin/complaints", label: "Complaints" },
];

export function AdminNav({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Admin sections"
      className="flex flex-wrap gap-2 border-b border-line pb-4"
    >
      {links.map((link) => {
        const active =
          link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex min-h-11 items-center rounded-md px-3 text-small font-medium",
              active
                ? "bg-brand-50 text-brand-dark"
                : "text-muted hover:bg-brand-50 hover:text-brand",
            )}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
