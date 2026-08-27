import { Suspense } from "react";
import {
  AdminDashboardMetrics,
  AdminIdentityChip,
} from "@/components/admin/AdminDashboardOverview";
import { AdminDashboardInsights } from "@/components/admin/AdminDashboardInsights";
import { DashboardInsightsFallback } from "@/components/dashboard/DashboardInsightsFallback";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAdminDashboardStats } from "@/domains/admin/users";
import { requireSuperAdmin } from "@/lib/auth/require";

export default async function AdminHomePage() {
  const user = await requireSuperAdmin();
  const stats = await getAdminDashboardStats(user);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        className="sm:items-center"
        eyebrow="Super Admin"
        title="Municipal control"
        description="Platform overview, complaint geography, and workload analysis."
        actions={<AdminIdentityChip user={user} />}
      />

      <AdminDashboardMetrics stats={stats} />

      <Suspense fallback={<DashboardInsightsFallback />}>
        <AdminDashboardInsights />
      </Suspense>
    </div>
  );
}
