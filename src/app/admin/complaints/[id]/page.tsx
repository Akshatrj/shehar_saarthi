import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminDeleteComplaintButton } from "@/components/admin/AdminDeleteComplaintButton";
import { AdminRoutingPanel } from "@/components/admin/AdminRoutingPanel";
import { ComplaintOverrideForm } from "@/components/admin/ComplaintOverrideForm";
import { ComplaintPhotoCard } from "@/components/complaints/ComplaintPhotoCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listActiveDepartmentsForSelect } from "@/domains/admin/departments";
import { getAdminComplaintDetail } from "@/domains/admin/complaints";
import { getCategoryRouteMap } from "@/domains/departments/routes";
import { requireSuperAdmin } from "@/lib/auth/require";
import {
  COMPLAINT_CATEGORY_LABELS,
  type ComplaintCategory,
  type ComplaintStatus,
} from "@/domains/complaints/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminComplaintDetailPage({ params }: PageProps) {
  const actor = await requireSuperAdmin();
  const { id } = await params;

  const [complaint, departments, routeMap] = await Promise.all([
    getAdminComplaintDetail(actor, id),
    listActiveDepartmentsForSelect(actor),
    getCategoryRouteMap(),
  ]);

  if (!complaint) {
    notFound();
  }

  const categoryRoutes = Object.fromEntries(
    [...routeMap.entries()].map(([category, department]) => [
      category,
      department.id,
    ]),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Complaint"
        title={complaint.publicRef}
        description={`Filed by ${complaint.citizen.name} · ${formatDate(complaint.createdAt)}`}
        actions={
          <Link href="/admin/complaints" className="text-small font-medium text-brand">
            Back to complaints
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <ComplaintPhotoCard src={complaint.imageUrl} />

        <div className="flex flex-col gap-4">
          <AdminRoutingPanel complaint={complaint} departments={departments} />

          <Card className="p-5">
            <StatusBadge status={complaint.status as ComplaintStatus} />
            <p className="mt-4 text-body text-ink">{complaint.description}</p>
            <dl className="mt-4 grid gap-3 text-small">
              <div>
                <dt className="font-medium text-navy">Category</dt>
                <dd className="text-muted">
                  {complaint.category
                    ? COMPLAINT_CATEGORY_LABELS[complaint.category as ComplaintCategory]
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-navy">Routing status</dt>
                <dd className="text-muted">{complaint.routingStatus}</dd>
              </div>
              <div>
                <dt className="font-medium text-navy">Location</dt>
                <dd className="text-muted">
                  {complaint.locationLabel ??
                    `${complaint.latitude}, ${complaint.longitude}`}
                </dd>
              </div>
              {complaint.contactPhone ? (
                <div>
                  <dt className="font-medium text-navy">Contact phone</dt>
                  <dd className="text-muted">{complaint.contactPhone}</dd>
                </div>
              ) : null}
              {complaint.aiDescription ? (
                <div>
                  <dt className="font-medium text-navy">AI explanation</dt>
                  <dd className="text-muted">{complaint.aiDescription}</dd>
                </div>
              ) : null}
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="text-h3 text-navy">Delete complaint</h2>
            <p className="mt-1 text-small text-muted">
              Permanently remove this complaint from every queue and delete the stored photo.
            </p>
            <div className="mt-4">
              <AdminDeleteComplaintButton complaintId={complaint.id} />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-h3 text-navy">Administrative override</h2>
            <p className="mt-1 text-small text-muted">
              Correct category or department metadata without changing workflow status.
            </p>
            <div className="mt-4">
              <ComplaintOverrideForm
                complaint={complaint}
                departments={departments}
                categoryRoutes={categoryRoutes}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
