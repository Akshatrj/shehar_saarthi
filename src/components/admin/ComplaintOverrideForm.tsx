"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { overrideComplaintAction } from "@/app/admin/actions";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { departmentSlugForCategory } from "@/domains/complaints/categories";
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

function defaultCategory(complaint: AdminComplaintDetail) {
  return complaint.category ?? complaint.aiCategory ?? "";
}

function defaultDepartmentId(
  complaint: AdminComplaintDetail,
  departments: Array<{ id: string; name: string; code: string }>,
) {
  if (complaint.department?.id) {
    return complaint.department.id;
  }
  const category = (complaint.category ?? complaint.aiCategory) as
    | ComplaintCategory
    | null;
  if (!category) return "";
  const slug = departmentSlugForCategory(category);
  if (!slug) return "";
  return departments.find((department) => department.code === slug)?.id ?? "";
}

export function ComplaintOverrideForm({
  complaint,
  departments,
}: {
  complaint: AdminComplaintDetail;
  departments: Array<{ id: string; name: string; code: string }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState(defaultCategory(complaint));
  const [departmentId, setDepartmentId] = useState(
    defaultDepartmentId(complaint, departments),
  );
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
        onChange={(event) => {
          const nextCategory = event.target.value as ComplaintCategory;
          setCategory(nextCategory);
          const slug = departmentSlugForCategory(nextCategory);
          if (slug) {
            const match = departments.find((department) => department.code === slug);
            if (match) setDepartmentId(match.id);
          }
        }}
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
