import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ButtonLink } from "@/components/ui/Button";
import type { CitizenComplaintSummary } from "@/domains/complaints/constants";
import {
  COMPLAINT_CATEGORY_LABELS,
  type ComplaintCategory,
  type ComplaintStatus,
} from "@/domains/complaints/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ComplaintList({
  complaints,
}: {
  complaints: CitizenComplaintSummary[];
}) {
  if (complaints.length === 0) {
    return (
      <EmptyState
        title="No complaints yet"
        description="Report a pothole, garbage pile, or other civic issue. Your submissions will appear here."
        action={
          <ButtonLink href="/citizen/report" size="sm">
            Report an issue
          </ButtonLink>
        }
      />
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {complaints.map((complaint) => (
        <li key={complaint.id}>
          <Link
            href={`/citizen/complaints/${complaint.id}`}
            className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-paper-raised transition-colors hover:border-brand/40 hover:bg-brand-50/30"
          >
            <div className="relative h-36 w-full bg-paper">
              <Image
                src={complaint.imageUrl}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-small font-semibold text-brand">
                  {complaint.publicRef}
                </span>
                <StatusBadge status={complaint.status as ComplaintStatus} />
              </div>
              {complaint.category ? (
                <p className="text-small font-medium text-muted">
                  {COMPLAINT_CATEGORY_LABELS[complaint.category as ComplaintCategory]}
                </p>
              ) : null}
              <p className="line-clamp-2 flex-1 text-body text-ink">
                {complaint.description}
              </p>
              <p className="text-small text-muted">
                Submitted {formatDate(complaint.createdAt)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
