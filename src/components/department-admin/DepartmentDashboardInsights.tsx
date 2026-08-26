import { Suspense } from "react";
import { ComplaintsMapSection } from "@/components/dashboard/ComplaintsMapSection";
import { MapSectionFallback } from "@/components/dashboard/MapSectionFallback";
import { PortalDashboardCharts } from "@/components/dashboard/PortalDashboardCharts";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { getDashboardAnalytics } from "@/domains/complaints/dashboard-analytics";

async function DepartmentDashboardMap({
  departmentId,
  departmentName,
}: {
  departmentId: string;
  departmentName: string;
}) {
  const analytics = await getDashboardAnalytics({
    departmentId,
  });

  return (
    <ComplaintsMapSection
      title={`${departmentName} complaint map`}
      description="Only complaints routed to your department are pinned. Open a pin to assign or update it."
      complaints={analytics.mapComplaints}
      detailPathPrefix="/department-admin/complaints"
      mapTotalCount={analytics.mapTotalCount}
      mapTruncated={analytics.mapTruncated}
    />
  );
}

async function DepartmentDashboardCharts({ departmentId }: { departmentId: string }) {
  const analytics = await getDashboardAnalytics({
    departmentId,
  });

  return <PortalDashboardCharts {...analytics} />;
}

function ChartsSectionFallback() {
  return (
    <Card className="flex h-56 items-center justify-center p-5" role="status">
      <Skeleton className="h-40 w-full rounded-lg" />
      <span className="sr-only">Loading charts</span>
    </Card>
  );
}

export function DepartmentDashboardInsights({
  departmentId,
  departmentName,
}: {
  departmentId: string;
  departmentName: string;
}) {
  return (
    <>
      <Suspense fallback={<MapSectionFallback />}>
        <DepartmentDashboardMap
          departmentId={departmentId}
          departmentName={departmentName}
        />
      </Suspense>
      <Suspense fallback={<ChartsSectionFallback />}>
        <DepartmentDashboardCharts departmentId={departmentId} />
      </Suspense>
    </>
  );
}
