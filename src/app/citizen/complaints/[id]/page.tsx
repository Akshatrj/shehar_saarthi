import Link from "next/link";
import { notFound } from "next/navigation";
import { CitizenCancelComplaintButton } from "@/components/citizen/CitizenCancelComplaintButton";
import { CitizenReopenComplaintForm } from "@/components/citizen/CitizenReopenComplaintForm";
import { ComplaintPhoto } from "@/components/complaints/ComplaintPhoto";
import { ComplaintTimeline } from "@/components/citizen/ComplaintTimeline";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getCitizenComplaintDetail } from "@/domains/complaints/citizen-tracking";
import { canCitizenCancelComplaint, canCitizenReopenComplaint } from "@/domains/complaints/service";
import { requireCitizen } from "@/lib/auth/require";
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

export default async function CitizenComplaintDetailPage({ params }: PageProps) {
  const user = await requireCitizen();
  const { id } = await params;
  const complaint = await getCitizenComplaintDetail(user, id);

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
            href="/citizen"
            className="text-small font-medium text-brand hover:text-brand-dark"
          >
            Back to my complaints
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
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={complaint.status as ComplaintStatus} />
            </div>

            <h2 className="mt-4 text-h3 text-navy">Description</h2>
            <p className="mt-2 text-body text-ink">{complaint.description}</p>

            <h2 className="mt-4 text-h3 text-navy">Category</h2>
            <p className="mt-2 text-body text-ink">
              {complaint.category
                ? COMPLAINT_CATEGORY_LABELS[complaint.category as ComplaintCategory]
                : "Not specified"}
            </p>

            {complaint.status !== "SUBMITTED" && complaint.aiCategory ? (
              <>
                <h2 className="mt-4 text-h3 text-navy">AI suggestion</h2>
                <p className="mt-2 text-body text-ink">
                  {COMPLAINT_CATEGORY_LABELS[complaint.aiCategory as ComplaintCategory]}
                </p>
                {complaint.aiDescription ? (
                  <p className="mt-2 text-small text-muted">
                    &ldquo;{complaint.aiDescription}&rdquo;
                  </p>
                ) : null}
              </>
            ) : null}

            <h2 className="mt-4 text-h3 text-navy">Department</h2>
            <p className="mt-2 text-body text-ink">
              {complaint.department?.name ?? "Not routed yet"}
            </p>

            <h2 className="mt-4 text-h3 text-navy">Location</h2>
            <p className="mt-2 text-body text-ink">
              {complaint.locationLabel ?? "Coordinates recorded"}
            </p>
            <p className="mt-1 font-mono text-small text-muted">
              {complaint.latitude}, {complaint.longitude}
            </p>

            {complaint.contactPhone ? (
              <>
                <h2 className="mt-4 text-h3 text-navy">Contact phone</h2>
                <p className="mt-2 text-body text-ink">{complaint.contactPhone}</p>
              </>
            ) : null}

            <h2 className="mt-4 text-h3 text-navy">Submitted</h2>
            <p className="mt-2 text-body text-ink">
              {formatDate(complaint.createdAt)}
            </p>

            {canCitizenCancelComplaint(complaint.status) ? (
              <div className="mt-5 border-t border-line pt-4">
                <CitizenCancelComplaintButton complaintId={complaint.id} />
              </div>
            ) : null}

            {canCitizenReopenComplaint(complaint.status) ? (
              <div className="mt-5 border-t border-line pt-4">
                <h2 className="text-h3 text-navy">Not satisfied?</h2>
                <div className="mt-3">
                  <CitizenReopenComplaintForm
                    complaintId={complaint.id}
                    status={complaint.status}
                  />
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </div>

      <Card className="p-5">
        <h2 className="text-h3 text-navy">Progress timeline</h2>
        <div className="mt-4">
          <ComplaintTimeline items={complaint.timeline} />
        </div>
      </Card>
    </div>
  );
}
