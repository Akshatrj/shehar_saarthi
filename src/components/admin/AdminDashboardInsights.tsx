import { ComplaintsMapSection } from "@/components/dashboard/ComplaintsMapSection";
import { PortalDashboardCharts } from "@/components/dashboard/PortalDashboardCharts";
import { getAdminDashboardAnalytics } from "@/domains/admin/analytics";
import { requireSuperAdmin } from "@/lib/auth/require";

export async function AdminDashboardInsights() {
  const user = await requireSuperAdmin();
  const analytics = await getAdminDashboardAnalytics(user);

  return (
    <>
      <ComplaintsMapSection
        title="Complaint map"
        description="Reported issues plotted by GPS. Map loads on scroll and caps pins for performance."
        complaints={analytics.mapComplaints}
        detailPathPrefix="/admin/complaints"
        mapTotalCount={analytics.mapTotalCount}
        mapTruncated={analytics.mapTruncated}
      />
      <PortalDashboardCharts {...analytics} />
    </>
  );
}
