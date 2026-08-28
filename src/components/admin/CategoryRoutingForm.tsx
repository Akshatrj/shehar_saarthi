"use client";

import { FormEvent, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { updateCategoryRoutingAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Select } from "@/components/ui/Select";
import type { CategoryRoutingRow } from "@/domains/admin/departments";

export function CategoryRoutingForm({
  routes,
  departments,
}: {
  routes: CategoryRoutingRow[];
  departments: Array<{ id: string; name: string; isActive: boolean }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [assignments, setAssignments] = useState<Record<string, string>>(
    Object.fromEntries(routes.map((row) => [row.category, row.departmentId])),
  );

  const departmentOptions = [
    { value: "", label: "Unassigned" },
    ...departments.map((department) => ({
      value: department.id,
      label: department.isActive
        ? department.name
        : `${department.name} (inactive)`,
    })),
  ];

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData();
    for (const [category, departmentId] of Object.entries(assignments)) {
      formData.set(`route_${category}`, departmentId);
    }

    startTransition(async () => {
      const result = await updateCategoryRoutingAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {success ? (
        <Alert variant="success">Category routing saved.</Alert>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {routes.map((row) => (
          <Select
            key={row.category}
            label={row.label}
            value={assignments[row.category] ?? ""}
            disabled={isPending}
            options={departmentOptions}
            onChange={(event) =>
              setAssignments((current) => ({
                ...current,
                [row.category]: event.target.value,
              }))
            }
          />
        ))}
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Saving…" : "Save category routing"}
      </Button>
    </form>
  );
}
