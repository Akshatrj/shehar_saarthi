import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PaginationNav } from "@/components/ui/PaginationNav";
import {
  AdminComplaintFilters,
  AdminComplaintTable,
} from "@/components/admin/AdminComplaintViews";
import { listAdminDepartments } from "@/domains/admin/departments";
import { listAdminComplaints } from "@/domains/admin/complaints";
import { requireSuperAdmin } from "@/lib/auth/require";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    departmentId?: string;
    status?: string;
    category?: string;
  }>;
};

export default async function AdminComplaintsPage({ searchParams }: PageProps) {
  const actor = await requireSuperAdmin();
  const params = await searchParams;
  const page = Number(params.page) > 0 ? Number(params.page) : 1;

  const [list, departments] = await Promise.all([
    listAdminComplaints(actor, {
      page,
      departmentId: params.departmentId,
      status: params.status,
      category: params.category,
    }),
    listAdminDepartments(actor),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Super Admin"
        title="Complaints"
        description="View all complaints and apply administrative overrides."
      />

      <Card className="flex flex-col gap-4 p-5">
        <AdminComplaintFilters
          departments={departments.map((department) => ({
            id: department.id,
            name: department.name,
          }))}
          current={{
            departmentId: params.departmentId,
            status: params.status,
            category: params.category,
          }}
        />
        <AdminComplaintTable complaints={list.complaints} />
        <PaginationNav
          page={list.page}
          hasMore={list.hasMore}
          basePath="/admin/complaints"
          searchParams={{
            departmentId: params.departmentId,
            status: params.status,
            category: params.category,
          }}
        />
      </Card>
    </div>
  );
}
