import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ComplaintOverrideForm } from "@/components/admin/ComplaintOverrideForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listActiveDepartmentsForSelect } from "@/domains/admin/departments";
import { getAdminComplaintDetail } from "@/domains/admin/complaints";
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

  const [complaint, departments] = await Promise.all([
    getAdminComplaintDetail(actor, id),
    listActiveDepartmentsForSelect(actor),
  ]);

  if (!complaint) {
    notFound();
  }

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
        <Card className="overflow-hidden p-0">
          <div className="relative aspect-[4/3] w-full bg-paper">
            <Image
              src={complaint.imageUrl}
              alt="Complaint photograph"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>
        </Card>

        <div className="flex flex-col gap-4">
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
                <dt className="font-medium text-navy">Department</dt>
                <dd className="text-muted">{complaint.department?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-medium text-navy">AI category</dt>
                <dd className="text-muted">
                  {complaint.aiCategory
                    ? COMPLAINT_CATEGORY_LABELS[complaint.aiCategory as ComplaintCategory]
                    : "—"}
                </dd>
              </div>
              {complaint.aiDescription ? (
                <div>
                  <dt className="font-medium text-navy">AI explanation</dt>
                  <dd className="text-muted">{complaint.aiDescription}</dd>
                </div>
              ) : null}
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="text-h3 text-navy">Administrative override</h2>
            <p className="mt-1 text-small text-muted">
              Correct category or department. Status is not changed.
            </p>
            <div className="mt-4">
              <ComplaintOverrideForm complaint={complaint} departments={departments} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
