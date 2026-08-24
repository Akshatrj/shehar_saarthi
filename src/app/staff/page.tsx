import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { PaginationNav } from "@/components/ui/PaginationNav";
import { StaffComplaintFilters } from "@/components/staff/StaffComplaintFilters";
import { StaffComplaintTable } from "@/components/staff/StaffComplaintTable";
import { StaffStatsGrid } from "@/components/staff/StaffStatsGrid";
import {
  getStaffComplaintStats,
  listStaffComplaints,
  parseStaffPage,
  parseStaffStatusFilter,
  requireStaffContext,
  StaffComplaintError,
} from "@/domains/complaints/staff-service";
import { requireStaff } from "@/lib/auth/require";

type PageProps = {
  searchParams: Promise<{ status?: string; page?: string }>;
};

export default async function StaffHomePage({ searchParams }: PageProps) {
  const user = await requireStaff();
  const params = await searchParams;

  let staffContext;
  try {
    staffContext = requireStaffContext(user);
  } catch (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Staff"
          title="Department desk"
          description="Complaints routed to your department appear here."
        />
        <Card className="p-5">
          <CardTitle>{user.name ?? user.email}</CardTitle>
          <CardDescription className="mt-2">
            {error instanceof StaffComplaintError
              ? error.message
              : "Your account cannot access the staff dashboard yet."}
          </CardDescription>
        </Card>
      </div>
    );
  }

  let statusFilter;
  try {
    statusFilter = parseStaffStatusFilter(params.status);
  } catch {
    statusFilter = undefined;
  }

  const page = parseStaffPage(params.page);
  const [stats, list] = await Promise.all([
    getStaffComplaintStats(staffContext.departmentId),
    listStaffComplaints(staffContext.departmentId, {
      status: statusFilter,
      page,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Staff"
        title="Department desk"
        description={`Signed in as ${user.name ?? user.email}. Showing complaints for your department only.`}
      />

      <StaffStatsGrid stats={stats} />

      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-h3 text-navy">Complaints</h2>
          <p className="text-small text-muted">
            Filter by status and open a complaint to assign or update work.
          </p>
        </div>

        <StaffComplaintFilters currentStatus={statusFilter} />
        <StaffComplaintTable complaints={list.complaints} />
        <PaginationNav
          page={list.page}
          hasMore={list.hasMore}
          basePath="/staff"
          searchParams={{ status: statusFilter }}
        />
      </Card>
    </div>
  );
}
