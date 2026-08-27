import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

function MetricSkeleton() {
  return (
    <Card className="ss-stat-card rounded-lg p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-7 w-12" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
        <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
      </div>
    </Card>
  );
}

export default function AdminAiLoading() {
  return (
    <div className="flex flex-col gap-8" role="status" aria-label="Loading AI monitoring">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-72 max-w-full" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-12 w-44 rounded-lg" />
      </div>

      <Card className="flex items-start gap-3 rounded-lg border-brand-200 bg-brand-50/40 p-4">
        <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-2 h-3 w-full max-w-md" />
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <MetricSkeleton key={`volume-${index}`} />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <MetricSkeleton key={`priority-${index}`} />
          ))}
        </div>
      </div>

      <Card className="overflow-hidden rounded-lg p-0 sm:p-0">
        <div className="border-b border-line px-5 py-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2 h-3 w-72 max-w-full" />
        </div>
        <div className="p-5">
          <Skeleton className="h-56 w-full rounded-lg" />
        </div>
      </Card>
    </div>
  );
}
