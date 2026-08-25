import { Suspense } from "react";
import { AdminDashboardInsights } from "@/components/admin/AdminDashboardInsights";
import { DashboardInsightsFallback } from "@/components/dashboard/DashboardInsightsFallback";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { getAdminDashboardStats } from "@/domains/admin/users";
import { requireSuperAdmin } from "@/lib/auth/require";

export default async function AdminHomePage() {
  const user = await requireSuperAdmin();
  const stats = await getAdminDashboardStats(user);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Super Admin"
        title="Municipal control"
        description="Platform overview, complaint geography, and workload analysis."
      />

      <Card className="p-5">
        <CardTitle>{user.name ?? user.email}</CardTitle>
        <CardDescription className="mt-2">
          Role: {user.role} · Full platform access
        </CardDescription>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={stats.totalUsers} href="/admin/users" />
        <StatCard label="Citizens" value={stats.citizens} />
        <StatCard label="Workers" value={stats.workers} />
        <StatCard label="Dept admins" value={stats.departmentAdmins} />
        <StatCard
          label="Departments"
          value={stats.departments}
          href="/admin/departments"
        />
        <StatCard
          label="Complaints"
          value={stats.totalComplaints}
          href="/admin/complaints"
        />
        <StatCard label="Open" value={stats.openComplaints} href="/admin/complaints" />
        <StatCard label="Completed/closed" value={stats.completedComplaints} />
      </div>

      <Suspense fallback={<DashboardInsightsFallback />}>
        <AdminDashboardInsights />
      </Suspense>
    </div>
  );
}
