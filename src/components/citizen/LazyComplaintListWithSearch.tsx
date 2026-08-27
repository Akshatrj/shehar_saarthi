"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";

function ComplaintListSkeleton() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Loading complaints">
      <Skeleton className="h-11 w-full rounded-md" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-52 rounded-lg" />
        <Skeleton className="h-52 rounded-lg" />
      </div>
    </div>
  );
}

export const LazyComplaintListWithSearch = dynamic(
  () =>
    import("@/components/citizen/ComplaintListWithSearch").then(
      (mod) => mod.ComplaintListWithSearch,
    ),
  {
    loading: () => <ComplaintListSkeleton />,
    ssr: false,
  },
);
