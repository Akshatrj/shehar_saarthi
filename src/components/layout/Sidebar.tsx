import { cn } from "@/lib/cn";
import type { NavItem } from "@/components/layout/Navbar";
import { SidebarLinks } from "@/components/layout/SidebarLinks";

type SidebarProps = {
  items: NavItem[];
  title: string;
  compact?: boolean;
};

export function Sidebar({ items, title, compact = false }: SidebarProps) {
  return (
    <aside
      className={cn(
        "border-b border-line bg-paper-raised md:border-b-0 md:border-r",
        compact ? "md:w-52" : "md:w-56",
      )}
    >
      <p className="hidden px-3 pt-4 text-xs font-semibold uppercase tracking-wider text-muted md:block">
        {title}
      </p>
      <nav aria-label={title} className="flex flex-nowrap gap-1 overflow-x-auto p-2 md:flex-col md:overflow-visible md:p-3">
        <SidebarLinks items={items} />
      </nav>
    </aside>
  );
}
