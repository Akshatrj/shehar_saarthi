import { ComplaintsMapSection } from "@/components/dashboard/ComplaintsMapSection";
import { PortalDashboardCharts } from "@/components/dashboard/PortalDashboardCharts";
import { getDashboardAnalytics } from "@/domains/complaints/dashboard-analytics";

export async function DepartmentDashboardInsights({
  departmentId,
  departmentName,
}: {
  departmentId: string;
  departmentName: string;
}) {
  const analytics = await getDashboardAnalytics({ departmentId });

  return (
    <>
      <ComplaintsMapSection
        title={`${departmentName} map`}
        description="Department complaints plotted by location. Pins load lazily to keep the desk fast."
        complaints={analytics.mapComplaints}
        detailPathPrefix="/department-admin/complaints"
        mapTotalCount={analytics.mapTotalCount}
        mapTruncated={analytics.mapTruncated}
      />
      <PortalDashboardCharts {...analytics} />
    </>
  );
}
