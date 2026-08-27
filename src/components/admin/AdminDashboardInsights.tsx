import { ChartColumn, MapPin } from "lucide-react";
import { ComplaintsMapSection } from "@/components/dashboard/ComplaintsMapSection";
import { PortalDashboardCharts } from "@/components/dashboard/PortalDashboardCharts";
import { getAdminDashboardAnalytics } from "@/domains/admin/analytics";
import { requireSuperAdmin } from "@/lib/auth/require";

export async function AdminDashboardInsights() {
  const user = await requireSuperAdmin();
  const analytics = await getAdminDashboardAnalytics(user);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand">
            <MapPin className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-small font-semibold text-navy">Geography</h2>
            <p className="mt-0.5 text-xs text-muted">
              Live complaint locations across the city.
            </p>
          </div>
        </div>
        <ComplaintsMapSection
          title="Complaint map"
          description="Reported issues plotted by GPS. Map loads on scroll and caps pins for performance."
          complaints={analytics.mapComplaints}
          detailPathPrefix="/admin/complaints"
          mapTotalCount={analytics.mapTotalCount}
          mapTruncated={analytics.mapTruncated}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand">
            <ChartColumn className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-small font-semibold text-navy">Trends</h2>
            <p className="mt-0.5 text-xs text-muted">
              Volume, pipeline mix, and category workload.
            </p>
          </div>
        </div>
        <PortalDashboardCharts {...analytics} />
      </section>
    </div>
  );
}
