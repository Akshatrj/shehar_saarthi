import Link from "next/link";
import { Inbox } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PaginationNav } from "@/components/ui/PaginationNav";
import { StatCard } from "@/components/ui/StatCard";
import {
  AdminComplaintFilters,
  AdminComplaintTable,
} from "@/components/admin/AdminComplaintViews";
import { AutoRouteAllButton } from "@/components/admin/AdminRoutingPanel";
import { listAdminDepartments } from "@/domains/admin/departments";
import {
  countAwaitingRouting,
  listAdminComplaints,
} from "@/domains/admin/complaints";
import { requireSuperAdmin } from "@/lib/auth/require";
import { cn } from "@/lib/cn";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    departmentId?: string;
    status?: string;
    category?: string;
    awaitingRouting?: string;
  }>;
};

export default async function AdminComplaintsPage({ searchParams }: PageProps) {
  const actor = await requireSuperAdmin();
  const params = await searchParams;
  const page = Number(params.page) > 0 ? Number(params.page) : 1;
  const awaitingRouting = params.awaitingRouting === "1";

  const [list, departments, awaitingCount] = await Promise.all([
    listAdminComplaints(actor, {
      page,
      departmentId: params.departmentId,
      status: params.status,
      category: params.category,
      awaitingRouting,
    }),
    listAdminDepartments(actor),
    countAwaitingRouting(actor),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Super Admin"
        title="Complaints"
        description="Review AI routing recommendations and assign departments."
        actions={<AutoRouteAllButton />}
      />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_16.5rem]">
        <Card className="ss-stat-card flex flex-col justify-end gap-4 rounded-lg p-4 sm:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Filters
            </p>
            <p className="mt-1 text-small text-navy">
              Narrow the queue by department, status, or category.
            </p>
          </div>
          <AdminComplaintFilters
            departments={departments.map((department) => ({
              id: department.id,
              name: department.name,
            }))}
            current={{
              departmentId: params.departmentId,
              status: params.status,
              category: params.category,
              awaitingRouting,
            }}
          />
        </Card>
        <StatCard
          label="Awaiting assignment"
          value={awaitingCount}
          hint={
            awaitingRouting
              ? "Filter is on — open a complaint to assign"
              : "Submitted and unassigned"
          }
          href={
            awaitingRouting
              ? "/admin/complaints"
              : "/admin/complaints?awaitingRouting=1&status=SUBMITTED"
          }
          icon={Inbox}
          tone="warning"
          className={cn(awaitingRouting && "border-warning ring-1 ring-warning/25")}
        />
      </div>

      <Card className="flex flex-col gap-4 rounded-lg p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-small font-semibold text-navy">Complaint queue</p>
          {awaitingRouting ? (
            <Link
              href="/admin/complaints"
              className="text-small font-medium text-brand hover:underline"
            >
              Showing awaiting assignment · Clear
            </Link>
          ) : (
            <Link
              href="/admin/complaints?awaitingRouting=1&status=SUBMITTED"
              className="text-small font-medium text-brand hover:underline"
            >
              Show awaiting assignment
            </Link>
          )}
        </div>
        <AdminComplaintTable complaints={list.complaints} />
        <PaginationNav
          page={list.page}
          hasMore={list.hasMore}
          basePath="/admin/complaints"
          searchParams={{
            departmentId: params.departmentId,
            status: params.status,
            category: params.category,
            awaitingRouting: awaitingRouting ? "1" : undefined,
          }}
        />
      </Card>
    </div>
  );
}
