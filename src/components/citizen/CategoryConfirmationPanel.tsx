"use client";

import { Alert } from "@/components/ui/Alert";
import {
  COMPLAINT_CATEGORY_LABELS,
  type ComplaintCategory,
} from "@/domains/complaints/types";
import type { CitizenComplaintDetail } from "@/domains/complaints/constants";

type CategoryConfirmationPanelProps = {
  complaint: CitizenComplaintDetail;
};

export function CategoryConfirmationPanel({
  complaint,
}: CategoryConfirmationPanelProps) {
  const categoryLabel = complaint.category
    ? COMPLAINT_CATEGORY_LABELS[complaint.category as ComplaintCategory]
    : null;

  if (complaint.status === "SUBMITTED" && !complaint.department) {
    return (
      <Alert variant="info" live="polite">
        <p className="font-medium text-navy">Awaiting department assignment</p>
        <p className="mt-1 text-small text-muted">
          You selected{" "}
          <strong>{categoryLabel ?? "your complaint category"}</strong>. Our team
          will review the AI routing recommendation and assign the right department.
          You do not need to choose a department.
        </p>
        {complaint.aiCategory ? (
          <p className="mt-2 text-small text-muted">
            AI suggestion:{" "}
            {COMPLAINT_CATEGORY_LABELS[complaint.aiCategory as ComplaintCategory]}
            {complaint.aiDescription ? ` — ${complaint.aiDescription}` : ""}
          </p>
        ) : null}
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {categoryLabel ? (
        <p className="text-body text-ink">
          <span className="font-medium text-navy">Category:</span> {categoryLabel}
        </p>
      ) : null}
      {complaint.department ? (
        <p className="text-body text-ink">
          <span className="font-medium text-navy">Department:</span>{" "}
          {complaint.department.name}
        </p>
      ) : null}
    </div>
  );
}
