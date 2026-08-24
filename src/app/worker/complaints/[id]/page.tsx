import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ComplaintHistoryList } from "@/components/complaints/ComplaintHistoryList";
import { WorkerComplaintActions } from "@/components/worker/WorkerComplaintActions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  COMPLAINT_CATEGORY_LABELS,
  type ComplaintCategory,
  type ComplaintStatus,
} from "@/domains/complaints/types";
import {
  getWorkerComplaintDetail,
  requireWorkerContext,
} from "@/domains/complaints/worker-service";
import { requireWorker } from "@/lib/auth/require";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function WorkerComplaintDetailPage({ params }: PageProps) {
  const user = await requireWorker();
  const { id } = await params;

  let workerContext;
  try {
    workerContext = requireWorkerContext(user);
  } catch {
    notFound();
  }

  const complaint = await getWorkerComplaintDetail(workerContext, id);

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
          <Link href="/worker" className="text-small font-medium text-brand">
            Back to desk
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
            <h2 className="mt-3 text-h3 text-navy">Description</h2>
            <p className="mt-2 text-body text-ink">{complaint.description}</p>
            <h2 className="mt-4 text-h3 text-navy">Location</h2>
            <p className="mt-2 text-body text-ink">
              {complaint.locationLabel ?? "Coordinates recorded"}
            </p>
            <p className="mt-1 font-mono text-small text-muted">
              {complaint.latitude}, {complaint.longitude}
            </p>
            <h2 className="mt-4 text-h3 text-navy">Category</h2>
            <p className="mt-2 text-body text-ink">
              {complaint.category
                ? COMPLAINT_CATEGORY_LABELS[complaint.category as ComplaintCategory]
                : "Not set"}
            </p>
            {complaint.aiCategory ? (
              <>
                <h2 className="mt-4 text-h3 text-navy">AI suggestion</h2>
                <p className="mt-2 text-body text-ink">
                  {COMPLAINT_CATEGORY_LABELS[complaint.aiCategory as ComplaintCategory]}
                </p>
              </>
            ) : null}
            <h2 className="mt-4 text-h3 text-navy">Department</h2>
            <p className="mt-2 text-body text-ink">{complaint.department.name}</p>
          </Card>

          <Card className="p-5">
            <h2 className="text-h3 text-navy">Actions</h2>
            <div className="mt-4">
              <WorkerComplaintActions
                complaintId={complaint.id}
                status={complaint.status}
                assignedWorkerId={complaint.assignedWorkerId}
                currentWorkerId={workerContext.workerId}
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
