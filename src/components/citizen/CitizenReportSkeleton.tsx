import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function CitizenReportSkeleton() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Loading report form">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-48 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <Card className="flex flex-col gap-6 p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <Skeleton className="h-44 w-full rounded-xl" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-28 w-full rounded-md" />
        </div>
        <div className="rounded-xl border border-line p-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-full max-w-md" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-11 w-full rounded-md" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 w-36 rounded-md" />
          <Skeleton className="h-11 w-24 rounded-md" />
        </div>
      </Card>

      <span className="sr-only">Loading</span>
    </div>
  );
}
