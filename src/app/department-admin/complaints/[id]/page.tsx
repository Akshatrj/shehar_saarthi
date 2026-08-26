import Link from "next/link";
import { notFound } from "next/navigation";
import { ComplaintHistoryList } from "@/components/complaints/ComplaintHistoryList";
import { ComplaintPhoto } from "@/components/complaints/ComplaintPhoto";
import { DepartmentAdminComplaintActions } from "@/components/department-admin/DepartmentAdminComplaintActions";
import { DepartmentAdminAiInsights } from "@/components/department-admin/DepartmentAdminAiInsights";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  COMPLAINT_CATEGORY_LABELS,
  type ComplaintCategory,
  type ComplaintStatus,
} from "@/domains/complaints/types";
import {
  getDepartmentAdminComplaintDetail,
  listActiveDepartmentWorkers,
  requireDepartmentAdminContext,
} from "@/domains/complaints/department-admin-service";
import { requireDepartmentAdmin } from "@/lib/auth/require";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function DepartmentAdminComplaintDetailPage({
  params,
}: PageProps) {
  const user = await requireDepartmentAdmin();
  const { id } = await params;

  let adminContext;
  try {
    adminContext = requireDepartmentAdminContext(user);
  } catch {
    notFound();
  }

  const [complaint, workers] = await Promise.all([
    getDepartmentAdminComplaintDetail(adminContext.departmentId, id),
    listActiveDepartmentWorkers(adminContext.departmentId),
  ]);

  if (!complaint) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Complaint"
        title={complaint.publicRef}
        description={`Submitted ${formatDate(complaint.createdAt)}`}
        actions={
          <Link
            href="/department-admin"
            className="text-small font-medium text-brand"
          >
            Back to desk
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden p-0">
          <div className="relative aspect-[4/3] w-full bg-paper">
            <ComplaintPhoto src={complaint.imageUrl} />
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <StatusBadge status={complaint.status as ComplaintStatus} />
            <p className="mt-4 text-body text-ink">{complaint.description}</p>
            <p className="mt-4 text-small text-muted">
              Worker: {complaint.assignedWorker?.name ?? "Unassigned"}
            </p>
            <p className="mt-2 text-small text-muted">
              Category:{" "}
              {complaint.category
                ? COMPLAINT_CATEGORY_LABELS[complaint.category as ComplaintCategory]
                : "—"}
            </p>
            {complaint.contactPhone ? (
              <p className="mt-2 text-small text-muted">
                Contact phone: {complaint.contactPhone}
              </p>
            ) : null}
          </Card>

          <DepartmentAdminAiInsights complaint={complaint} />

          <Card className="p-5">
            <h2 className="text-h3 text-navy">Actions</h2>
            <div className="mt-4">
              <DepartmentAdminComplaintActions
                complaintId={complaint.id}
                status={complaint.status}
                assignedWorkerId={complaint.assignedWorker?.id}
                workers={workers}
              />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-h3 text-navy">History</h2>
            <div className="mt-4">
              <ComplaintHistoryList history={complaint.history} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
