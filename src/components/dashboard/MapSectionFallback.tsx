import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function MapSectionFallback() {
  return (
    <Card className="flex h-[420px] flex-col justify-between p-5" role="status">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>
      <Skeleton className="h-[300px] w-full rounded-lg" />
      <span className="sr-only">Loading map</span>
    </Card>
  );
}
