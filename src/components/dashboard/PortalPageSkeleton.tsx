import { DashboardInsightsFallback } from "@/components/dashboard/DashboardInsightsFallback";
import { Skeleton } from "@/components/ui/Skeleton";

export function PortalPageSkeleton({ withInsights = true }: { withInsights?: boolean }) {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Loading portal">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-lg" />
        ))}
      </div>

      {withInsights ? <DashboardInsightsFallback /> : null}
      <span className="sr-only">Loading</span>
    </div>
  );
}
