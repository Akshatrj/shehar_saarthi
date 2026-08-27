import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  ListPageSkeleton,
  TableRowsSkeleton,
} from "@/components/dashboard/ListPageSkeleton";

export default function AdminDepartmentsLoading() {
  return (
    <ListPageSkeleton
      eyebrow="Super Admin"
      title="Departments"
      description="Create, edit, and activate municipal departments."
    >
      <Card className="p-5">
        <Skeleton className="h-6 w-48" />
        <div className="mt-4 max-w-md space-y-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-32" />
        </div>
      </Card>
      <TableRowsSkeleton rows={5} />
    </ListPageSkeleton>
  );
}
