import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

type ListPageSkeletonProps = {
  eyebrow: string;
  title: string;
  description: string;
  label?: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export function TableRowsSkeleton({
  rows = 6,
}: {
  rows?: number;
}) {
  return (
    <Card className="flex flex-col gap-3 rounded-lg p-4 sm:p-5">
      <Skeleton className="h-4 w-36" />
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </Card>
  );
}

export function ListPageSkeleton({
  eyebrow,
  title,
  description,
  label,
  actions,
  children,
}: ListPageSkeletonProps) {
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-label={label ?? `Loading ${title}`}
    >
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
      />
      {children ?? <TableRowsSkeleton />}
      <span className="sr-only">Loading</span>
    </div>
  );
}
