import Link from "next/link";
import { Suspense } from "react";
import { AdminDashboardInsights } from "@/components/admin/AdminDashboardInsights";
import { DashboardInsightsFallback } from "@/components/dashboard/DashboardInsightsFallback";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { getAdminDashboardStats } from "@/domains/admin/users";
import { requireSuperAdmin } from "@/lib/auth/require";

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-small text-muted">{label}</p>
      <p className="mt-1 text-h2 text-navy">{value}</p>
    </>
  );

  if (!href) {
    return <Card className="p-4">{content}</Card>;
  }

  return (
    <Link href={href} className="group block">
      <Card className="p-4 transition-colors group-hover:border-brand group-hover:bg-brand-50/40">
        {content}
        <p className="mt-2 text-xs font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
          Open {label.toLowerCase()}
        </p>
      </Card>
    </Link>
  );
}

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
