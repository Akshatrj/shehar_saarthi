"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { overrideComplaintAction } from "@/app/admin/actions";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_CATEGORY_LABELS,
  type ComplaintCategory,
} from "@/domains/complaints/types";
import type { AdminComplaintDetail } from "@/domains/admin/complaints";

const categoryOptions = COMPLAINT_CATEGORIES.map((value) => ({
  value,
  label: COMPLAINT_CATEGORY_LABELS[value],
}));

export function ComplaintOverrideForm({
  complaint,
  departments,
}: {
  complaint: AdminComplaintDetail;
  departments: Array<{ id: string; name: string; slug: string }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState(complaint.category ?? "");
  const [departmentId, setDepartmentId] = useState(complaint.department?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function onSubmit() {
    setError(null);
    setSuccess(false);
    const formData = new FormData();
    formData.set("category", category);
    formData.set("departmentId", departmentId);

    startTransition(async () => {
      const result = await overrideComplaintAction(complaint.id, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {success ? <Alert variant="success">Override saved.</Alert> : null}
      <Select
        label="Category"
        value={category}
        disabled={isPending}
        placeholder="Choose category"
        options={categoryOptions}
        onChange={(event) =>
          setCategory(event.target.value as ComplaintCategory)
        }
      />
      <Select
        label="Department"
        value={departmentId}
        disabled={isPending}
        placeholder="Choose department"
        options={departments.map((department) => ({
          value: department.id,
          label: department.name,
        }))}
        onChange={(event) => setDepartmentId(event.target.value)}
      />
      <Button type="button" size="sm" disabled={isPending} onClick={onSubmit}>
        {isPending ? "Saving…" : "Apply override"}
      </Button>
    </div>
  );
}
