import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { PaginationNav } from "@/components/ui/PaginationNav";
import { DashboardInsightsFallback } from "@/components/dashboard/DashboardInsightsFallback";
import { DepartmentAdminComplaintFilters } from "@/components/department-admin/DepartmentAdminComplaintFilters";
import { DepartmentAdminComplaintTable } from "@/components/department-admin/DepartmentAdminComplaintTable";
import { DepartmentAdminStatsGrid } from "@/components/department-admin/DepartmentAdminStatsGrid";
import { DepartmentDashboardInsights } from "@/components/department-admin/DepartmentDashboardInsights";
import {
  getDepartmentAdminDepartment,
  getDepartmentAdminStats,
  listDepartmentAdminComplaints,
  parseDepartmentAdminPage,
  parseDepartmentAdminStatusFilter,
  requireDepartmentAdminContext,
  DepartmentAdminError,
} from "@/domains/complaints/department-admin-service";
import { requireDepartmentAdmin } from "@/lib/auth/require";

type PageProps = {
  searchParams: Promise<{ status?: string; page?: string }>;
};

export default async function DepartmentAdminHomePage({
  searchParams,
}: PageProps) {
  const user = await requireDepartmentAdmin();
  const params = await searchParams;

  let adminContext;
  try {
    adminContext = requireDepartmentAdminContext(user);
  } catch (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Department admin"
          title="Department desk"
          description="Manage complaints and workers for your department."
        />
        <Card className="p-5">
          <CardTitle>{user.name ?? user.email}</CardTitle>
          <CardDescription className="mt-2">
            {error instanceof DepartmentAdminError
              ? error.message
              : "Your account cannot access the department admin dashboard yet."}
          </CardDescription>
        </Card>
      </div>
    );
  }

  let statusFilter;
  try {
    statusFilter = parseDepartmentAdminStatusFilter(params.status);
  } catch {
    statusFilter = undefined;
  }

  const page = parseDepartmentAdminPage(params.page);
  const [department, stats, list] = await Promise.all([
    getDepartmentAdminDepartment(adminContext.departmentId),
    getDepartmentAdminStats(adminContext.departmentId),
    listDepartmentAdminComplaints(adminContext.departmentId, {
      status: statusFilter,
      page,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Department admin"
        title={department?.name ?? "Department desk"}
        description={`Signed in as ${user.name ?? user.email}. Department complaints and workers.`}
        actions={
          <Link
            href="/department-admin/workers"
            className="text-small font-medium text-brand"
          >
            Manage workers
          </Link>
        }
      />

      <DepartmentAdminStatsGrid stats={stats} />

      <Suspense fallback={<DashboardInsightsFallback />}>
        <DepartmentDashboardInsights
          departmentId={adminContext.departmentId}
          departmentName={department?.name ?? "Department"}
        />
      </Suspense>

      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-h3 text-navy">Complaints</h2>
          <p className="text-small text-muted">
            Assign routed complaints to workers and close completed work.
          </p>
        </div>

        <DepartmentAdminComplaintFilters currentStatus={statusFilter} />
        <DepartmentAdminComplaintTable complaints={list.complaints} />
        <PaginationNav
          page={list.page}
          hasMore={list.hasMore}
          basePath="/department-admin"
          searchParams={{ status: statusFilter }}
        />
      </Card>
    </div>
  );
}
