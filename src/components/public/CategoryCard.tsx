import Link from "next/link";
import type { CivicCategory } from "@/content/civic-categories";
import { PUBLIC_REPORT_HREF } from "@/lib/public-routes";
import { cn } from "@/lib/cn";

type CategoryCardProps = {
  category: CivicCategory;
  className?: string;
};

export function CategoryCard({ category, className }: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <Link
      href={PUBLIC_REPORT_HREF}
      className={cn(
        "ss-category-card group flex h-full flex-col rounded-xl border border-line bg-paper-raised p-5 shadow-sm",
        className,
      )}
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand">
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-body font-semibold text-navy group-hover:text-brand-dark">
        {category.title}
      </h3>
      <p className="mt-2 flex-1 text-small leading-relaxed text-muted">
        {category.description}
      </p>
      <span className="mt-4 text-small font-medium text-brand group-hover:underline">
        Report this issue
      </span>
    </Link>
  );
}
