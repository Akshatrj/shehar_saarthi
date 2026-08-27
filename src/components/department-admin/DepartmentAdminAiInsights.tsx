import { Card } from "@/components/ui/Card";
import type { DepartmentAdminComplaintDetail } from "@/domains/complaints/constants";

function evidenceReviewStatus(complaint: DepartmentAdminComplaintDetail) {
  if (complaint.evidenceConsistency === "POTENTIAL_MISMATCH") {
    return "POTENTIAL_MISMATCH";
  }
  if (complaint.requiresManualReview) {
    return complaint.evidenceConsistency === "NEEDS_REVIEW"
      ? "NEEDS_REVIEW"
      : "LOW_CONFIDENCE";
  }
  return "NORMAL";
}

const reviewLabels: Record<string, string> = {
  NORMAL: "Normal",
  LOW_CONFIDENCE: "Low confidence",
  POTENTIAL_MISMATCH: "Potential evidence mismatch",
  NEEDS_REVIEW: "Needs review",
};

export function DepartmentAdminAiInsights({
  complaint,
}: {
  complaint: DepartmentAdminComplaintDetail;
}) {
  const reviewStatus = evidenceReviewStatus(complaint);

  if (!complaint.aiCategory && !complaint.aiPriority) {
    return (
      <Card className="p-5">
        <h2 className="text-h3 text-navy">Civic intelligence</h2>
        <p className="mt-2 text-small text-muted">
          AI analysis is not available for this complaint yet. Routing and status
          updates continue normally.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h2 className="text-h3 text-navy">Civic intelligence</h2>
      <dl className="mt-4 grid gap-3 text-small">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Priority</dt>
          <dd className="font-medium text-navy">
            {complaint.aiPriority ?? "—"}
            {complaint.priorityScore != null ? ` (${complaint.priorityScore})` : ""}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Civic impact</dt>
          <dd className="font-medium text-navy">
            {complaint.civicImpactScore ?? "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Category confidence</dt>
          <dd className="font-medium text-navy">
            {complaint.aiCategoryConfidence != null
              ? `${Math.round(complaint.aiCategoryConfidence * 100)}%`
              : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Evidence status</dt>
          <dd className="font-medium text-navy">
            {complaint.evidenceConsistency ?? "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Review status</dt>
          <dd className="font-medium text-navy">{reviewLabels[reviewStatus]}</dd>
        </div>
        {complaint.recommendedDepartmentName ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Recommended department</dt>
            <dd className="font-medium text-navy">
              {complaint.recommendedDepartmentName}
            </dd>
          </div>
        ) : null}
        {complaint.recommendedAction ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Recommended action</dt>
            <dd className="font-medium text-navy">{complaint.recommendedAction}</dd>
          </div>
        ) : null}
      </dl>
      {complaint.priorityReason ? (
        <p className="mt-4 rounded-md bg-paper-raised px-3 py-2 text-small text-ink">
          {complaint.priorityReason}
        </p>
      ) : null}
      {complaint.evidenceReason ? (
        <p className="mt-2 text-small text-muted">{complaint.evidenceReason}</p>
      ) : null}
    </Card>
  );
}
