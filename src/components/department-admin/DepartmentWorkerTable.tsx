"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { activateWorker, deactivateWorker } from "@/app/department-admin/actions";
import type { DepartmentWorkerRow } from "@/domains/complaints/constants";

export function DepartmentWorkerTable({
  workers,
}: {
  workers: DepartmentWorkerRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function runAction(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Action failed.");
        return;
      }
      router.refresh();
    });
  }

  if (workers.length === 0) {
    return (
      <p className="text-small text-muted">
        No workers are linked to this department yet. Ask a super admin to assign
        the WORKER role.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <Alert variant="danger" live="assertive">
          {error}
        </Alert>
      ) : null}
      <ul className="flex flex-col gap-3">
        {workers.map((worker) => (
          <li
            key={worker.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line px-4 py-3"
          >
            <div>
              <p className="font-medium text-navy">{worker.name}</p>
              <p className="text-small text-muted">{worker.email}</p>
              <p className="text-small text-muted">
                {worker.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <Button
              type="button"
              variant={worker.isActive ? "secondary" : "primary"}
              disabled={isPending}
              onClick={() =>
                runAction(() =>
                  worker.isActive
                    ? deactivateWorker(worker.id)
                    : activateWorker(worker.id),
                )
              }
            >
              {worker.isActive ? "Deactivate" : "Activate"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
