"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { controlClassName } from "@/components/ui/Field";
import { assignWorker, closeComplaint } from "@/app/department-admin/actions";

type DepartmentAdminComplaintActionsProps = {
  complaintId: string;
  status: string;
  workers: Array<{ id: string; name: string }>;
};

export function DepartmentAdminComplaintActions({
  complaintId,
  status,
  workers,
}: DepartmentAdminComplaintActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [workerId, setWorkerId] = useState(workers[0]?.id ?? "");

  async function run(
    action: () => Promise<{ ok: boolean; error?: string }>,
  ) {
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

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <Alert variant="danger" live="assertive">
          {error}
        </Alert>
      ) : null}

      {status === "ROUTED" ? (
        <div className="flex flex-col gap-2">
          <label htmlFor="workerId" className="text-label font-medium text-green-950">
            Assign to worker
          </label>
          <select
            id="workerId"
            value={workerId}
            onChange={(event) => setWorkerId(event.target.value)}
            className={cn(controlClassName, "border-line")}
          >
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.name}
              </option>
            ))}
          </select>
          <Button
            type="button"
            disabled={isPending || !workerId}
            onClick={() => run(() => assignWorker(complaintId, workerId))}
          >
            {isPending ? "Assigning…" : "Assign worker"}
          </Button>
        </div>
      ) : null}

      {status === "COMPLETED" ? (
        <Button
          type="button"
          disabled={isPending}
          onClick={() => run(() => closeComplaint(complaintId))}
        >
          {isPending ? "Closing…" : "Close complaint"}
        </Button>
      ) : null}
    </div>
  );
}
