"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import {
  changeCategory,
  confirmCategory,
} from "@/app/citizen/complaints/actions";
import {
  DEPARTMENT_NAMES,
  DEPARTMENT_SLUGS,
} from "@/domains/complaints/categories";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_CATEGORY_LABELS,
  type ComplaintCategory,
} from "@/domains/complaints/types";
import type { CitizenComplaintDetail } from "@/domains/complaints/constants";

type CategoryConfirmationPanelProps = {
  complaint: CitizenComplaintDetail;
};

const categoryOptions = COMPLAINT_CATEGORIES.map((value) => ({
  value,
  label: COMPLAINT_CATEGORY_LABELS[value],
}));

const departmentOptions = DEPARTMENT_SLUGS.map((slug) => ({
  value: slug,
  label: DEPARTMENT_NAMES[slug],
}));

export function CategoryConfirmationPanel({
  complaint,
}: CategoryConfirmationPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"review" | "change">("review");
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory>(
    (complaint.aiCategory as ComplaintCategory | null) ?? "OTHER",
  );
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canConfirm =
    complaint.status === "SUBMITTED" &&
    complaint.aiCategory &&
    complaint.aiCategory !== "OTHER";

  if (complaint.status !== "SUBMITTED") {
    return (
      <div className="flex flex-col gap-3">
        {complaint.category ? (
          <p className="text-body text-ink">
            <span className="font-medium text-navy">Category:</span>{" "}
            {COMPLAINT_CATEGORY_LABELS[complaint.category as ComplaintCategory]}
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

  function refreshAfterSuccess(message: string) {
    setSuccess(message);
    setError(null);
    startTransition(() => {
      router.refresh();
    });
  }

  function handleConfirm() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await confirmCategory(complaint.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      refreshAfterSuccess("Category confirmed and complaint routed.");
      setMode("review");
    });
  }

  function handleChangeSubmit() {
    setError(null);
    setSuccess(null);

    if (selectedCategory === "OTHER" && !selectedDepartment) {
      setError("Please choose a department for the Other category.");
      return;
    }

    startTransition(async () => {
      const result = await changeCategory(
        complaint.id,
        selectedCategory,
        selectedCategory === "OTHER" ? selectedDepartment : undefined,
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      refreshAfterSuccess("Category updated and complaint routed.");
      setMode("review");
    });
  }

  return (
    <div className="flex flex-col gap-4">
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

      {mode === "review" && complaint.aiCategory ? (
        <div className="rounded-md border border-line bg-paper px-4 py-4">
          <p className="text-small font-medium text-muted">AI suggested category</p>
          <p className="mt-1 text-h3 text-navy">
            {COMPLAINT_CATEGORY_LABELS[complaint.aiCategory as ComplaintCategory]}
          </p>
          {complaint.aiDescription ? (
            <>
              <p className="mt-4 text-small font-medium text-muted">AI explanation</p>
              <p className="mt-1 text-body text-ink">&ldquo;{complaint.aiDescription}&rdquo;</p>
            </>
          ) : null}
        </div>
      ) : null}

      {mode === "review" ? (
        <div className="flex flex-wrap gap-3">
          {canConfirm ? (
            <Button type="button" disabled={isPending} onClick={handleConfirm}>
              {isPending ? "Confirming…" : "Confirm"}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={() => {
              setMode("change");
              setError(null);
              setSuccess(null);
            }}
          >
            Change
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-md border border-line bg-paper-raised p-4">
          <Select
            label="Category"
            value={selectedCategory}
            disabled={isPending}
            options={categoryOptions}
            onChange={(event) => {
              setSelectedCategory(event.target.value as ComplaintCategory);
              setError(null);
            }}
          />

          {selectedCategory === "OTHER" ? (
            <Select
              label="Department"
              value={selectedDepartment}
              disabled={isPending}
              placeholder="Choose a department"
              options={departmentOptions}
              onChange={(event) => {
                setSelectedDepartment(event.target.value);
                setError(null);
              }}
            />
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="button" disabled={isPending} onClick={handleChangeSubmit}>
              {isPending ? "Saving…" : "Save category"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => {
                setMode("review");
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {!complaint.aiCategory && mode === "review" ? (
        <p className="text-small text-muted">
          Analyzing your complaint… If suggestions are unavailable, please select a
          category manually.
        </p>
      ) : null}
    </div>
  );
}
