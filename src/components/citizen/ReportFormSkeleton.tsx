import { Skeleton } from "@/components/ui/Skeleton";

export function ReportFormSkeleton() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Loading form">
      <Skeleton className="h-44 w-full rounded-xl" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-28 w-full rounded-md" />
      </div>
      <div className="rounded-xl border border-line p-5">
        <Skeleton className="h-5 w-40" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      </div>
      <Skeleton className="h-11 w-36 rounded-md" />
      <span className="sr-only">Loading form</span>
    </div>
  );
}
