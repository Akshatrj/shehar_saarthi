import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function ComplaintDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Loading complaint">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card className="self-start overflow-hidden p-0">
          <Skeleton className="aspect-[4/3] w-full" />
        </Card>
        <Card className="flex flex-col gap-3 p-5">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-8 w-full" />
        </Card>
      </div>

      <Card className="p-5">
        <Skeleton className="h-6 w-40" />
        <div className="mt-4 flex flex-col gap-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex gap-4">
              <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-2 h-4 w-64 max-w-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <span className="sr-only">Loading</span>
    </div>
  );
}
