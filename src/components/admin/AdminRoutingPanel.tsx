"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  acceptRoutingRecommendationAction,
  assignDepartmentAction,
  autoRouteAllAction,
} from "@/app/admin/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ChoiceTile } from "@/components/ui/ChoiceTile";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import {
  COMPLAINT_CATEGORY_LABELS,
  type ComplaintCategory,
} from "@/domains/complaints/types";
import type { AdminComplaintDetail } from "@/domains/admin/complaints";
import type { RankedDepartmentRecommendation } from "@/domains/routing/types";

type AdminRoutingPanelProps = {
  complaint: AdminComplaintDetail;
  departments: { id: string; name: string; code: string }[];
};

export function AdminRoutingPanel({
  complaint,
  departments,
}: AdminRoutingPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [manualReason, setManualReason] = useState("");

  const awaitingAssignment =
    complaint.status === "SUBMITTED" && !complaint.department;
  const categoryLabel = complaint.category
    ? COMPLAINT_CATEGORY_LABELS[complaint.category as ComplaintCategory]
    : "—";
  const aiLabel = complaint.aiCategory
    ? COMPLAINT_CATEGORY_LABELS[complaint.aiCategory as ComplaintCategory]
    : "—";
  const ranked = complaint.rankedRecommendations ?? [];

  function onAccept() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await acceptRoutingRecommendationAction(complaint.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess("Recommendation accepted. Complaint routed to department.");
      router.refresh();
    });
  }

  function onManualAssign() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await assignDepartmentAction(complaint.id, {
        departmentId: selectedDepartmentId,
        reason: manualReason,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess("Department assigned manually.");
      setShowManual(false);
      router.refresh();
    });
  }

  if (!awaitingAssignment) {
    return (
      <div className="rounded-xl border border-line bg-paper-raised p-5">
        <p className="text-small font-semibold uppercase tracking-wide text-muted">
          Final assignment
        </p>
        <p className="mt-2 text-h3 text-navy">
          {complaint.department?.name ?? "Not assigned"}
        </p>
        {complaint.routingReason ? (
          <p className="mt-2 text-small text-muted">{complaint.routingReason}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-brand-200 bg-brand-50/30 p-5">
      <div>
        <p className="text-small font-semibold uppercase tracking-wide text-brand">
          Awaiting department assignment
        </p>
        <p className="mt-1 text-body text-muted">
          Review the AI classification and routing recommendation, then accept or
          assign manually.
        </p>
      </div>

      {complaint.requiresManualReview ? (
        <Alert variant="warning" live="polite">
          Low AI confidence — manual review recommended.
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="danger" live="assertive">
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert variant="success" live="polite">
          {success}
        </Alert>
      ) : null}

      <dl className="grid gap-3 text-small sm:grid-cols-2">
        <div>
          <dt className="font-medium text-navy">Citizen category</dt>
          <dd className="text-muted">{categoryLabel}</dd>
        </div>
        <div>
          <dt className="font-medium text-navy">AI classification</dt>
          <dd className="text-muted">{aiLabel}</dd>
        </div>
        {complaint.aiCategoryConfidence !== null ? (
          <div>
            <dt className="font-medium text-navy">AI confidence</dt>
            <dd className="text-muted">
              {Math.round(complaint.aiCategoryConfidence * 100)}%
            </dd>
          </div>
        ) : null}
        {complaint.aiClassificationReason ? (
          <div className="sm:col-span-2">
            <dt className="font-medium text-navy">AI reason</dt>
            <dd className="text-muted">{complaint.aiClassificationReason}</dd>
          </div>
        ) : null}
      </dl>

      <div className="rounded-lg border border-line bg-paper-raised p-4">
        <p className="text-small font-semibold uppercase tracking-wide text-muted">
          AI recommendation
        </p>
        {complaint.recommendedDepartment ? (
          <>
            <p className="mt-2 text-h3 text-navy">
              {complaint.recommendedDepartment.name}
            </p>
            {complaint.routingReason ? (
              <p className="mt-2 text-small text-muted">{complaint.routingReason}</p>
            ) : null}
          </>
        ) : (
          <p className="mt-2 text-body text-muted">
            No suitable department found. Manual assignment required.
          </p>
        )}
      </div>

      {ranked.length > 0 ? (
        <div>
          <p className="text-small font-medium text-navy">Ranked departments</p>
          <ol className="mt-2 grid gap-2">
            {ranked.slice(0, 3).map((item: RankedDepartmentRecommendation, index) => (
              <li key={item.departmentId}>
                <ChoiceTile
                  selected={selectedDepartmentId === item.departmentId}
                  disabled={isPending}
                  onClick={() => {
                    setSelectedDepartmentId(item.departmentId);
                    setShowManual(true);
                  }}
                >
                  <span>
                    <span className="ss-choice-tile__title">
                      {index + 1}. {item.departmentName}
                    </span>
                    <span className="ss-choice-tile__muted">
                      {item.recommended
                        ? "Recommended match for this category"
                        : "Alternative department"}
                    </span>
                  </span>
                </ChoiceTile>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {complaint.recommendedDepartment ? (
          <Button type="button" disabled={isPending} onClick={onAccept}>
            {isPending ? "Routing…" : "Accept recommendation"}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          disabled={isPending}
          onClick={() => setShowManual((current) => !current)}
        >
          Change department
        </Button>
      </div>

      {showManual ? (
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <Select
            label="Department"
            placeholder="Select department"
            value={selectedDepartmentId}
            disabled={isPending}
            options={departments.map((department) => ({
              value: department.id,
              label: department.name,
            }))}
            onChange={(event) => setSelectedDepartmentId(event.target.value)}
          />
          <Field label="Reason (optional)" hint="Recorded in routing history.">
            {({ id, describedBy, invalid }) => (
              <textarea
                id={id}
                rows={2}
                disabled={isPending}
                value={manualReason}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                className="min-h-20 w-full rounded-md border border-line px-3 py-2 text-body"
                onChange={(event) => setManualReason(event.target.value)}
              />
            )}
          </Field>
          <Button
            type="button"
            disabled={isPending || !selectedDepartmentId}
            onClick={onManualAssign}
          >
            Assign department
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function AutoRouteAllButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onAutoRoute() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await autoRouteAllAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.summary) {
        setMessage(
          `${result.summary.processed} complaints processed · ${result.summary.routed} successfully routed · ${result.summary.manualRequired} require manual assignment`,
        );
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="secondary" disabled={isPending} onClick={onAutoRoute}>
        {isPending ? "Routing…" : "⚡ Auto Route All"}
      </Button>
      {message ? <p className="text-small text-success">{message}</p> : null}
      {error ? <p className="text-small text-danger">{error}</p> : null}
    </div>
  );
}
