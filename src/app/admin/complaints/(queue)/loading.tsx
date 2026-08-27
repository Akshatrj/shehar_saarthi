import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  ListPageSkeleton,
  TableRowsSkeleton,
} from "@/components/dashboard/ListPageSkeleton";

export default function AdminComplaintsLoading() {
  return (
    <ListPageSkeleton
      eyebrow="Super Admin"
      title="Complaints"
      description="Review AI routing recommendations and assign departments."
      actions={<Skeleton className="h-11 w-40 rounded-md" />}
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_16.5rem]">
        <Card className="flex flex-col justify-end gap-4 rounded-lg p-4 sm:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Filters
            </p>
            <p className="mt-1 text-small text-navy">
              Narrow the queue by department, status, or category.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <Skeleton className="h-11 w-full sm:w-48" />
            <Skeleton className="h-11 w-full sm:w-44" />
            <Skeleton className="h-11 w-full sm:w-44" />
            <Skeleton className="h-11 w-36" />
          </div>
        </Card>
        <Card className="flex flex-col justify-between rounded-lg p-4 sm:p-5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-3 h-10 w-12" />
          <Skeleton className="mt-2 h-4 w-40" />
        </Card>
      </div>
      <TableRowsSkeleton rows={6} />
    </ListPageSkeleton>
  );
}
