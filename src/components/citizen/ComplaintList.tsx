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
    <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-paper-raised">
      {complaints.map((complaint) => (
        <li key={complaint.id}>
          <Link
            href={`/citizen/complaints/${complaint.id}`}
            className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-brand-50/70 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-small font-semibold text-brand">
                  {complaint.publicRef}
                </span>
                <StatusBadge status={complaint.status as ComplaintStatus} />
                {complaint.category ? (
                  <span className="text-small text-muted">
                    {COMPLAINT_CATEGORY_LABELS[complaint.category as ComplaintCategory]}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 line-clamp-1 text-small text-ink">
                {complaint.description}
              </p>
            </div>
            <p className="shrink-0 text-xs text-muted sm:text-right">
              {formatDate(complaint.createdAt)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
