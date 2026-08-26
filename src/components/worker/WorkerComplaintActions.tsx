"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { startProgress, markCompleted } from "@/app/worker/actions";

type WorkerComplaintActionsProps = {
  complaintId: string;
  status: string;
  assignedWorkerId: string | null;
  currentWorkerId: string;
};

export function WorkerComplaintActions({
  complaintId,
  status,
  assignedWorkerId,
  currentWorkerId,
}: WorkerComplaintActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isAssignedWorker = assignedWorkerId === currentWorkerId;

  async function runAction(
    action: (id: string) => Promise<{ ok: boolean; error?: string }>,
  ) {
    setError(null);
    startTransition(async () => {
      const result = await action(complaintId);
      if (!result.ok) {
        setError(result.error ?? "Action failed.");
        return;
      }
      router.refresh();
    });
  }

  if (!isAssignedWorker) {
    return (
      <p className="text-small text-muted">
        This complaint is not assigned to you.
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

      {status === "ASSIGNED" ? (
        <Button
          type="button"
          disabled={isPending}
          onClick={() => runAction(startProgress)}
        >
          {isPending ? "Updating…" : "Start work"}
        </Button>
      ) : null}

      {status === "IN_PROGRESS" ? (
        <Button
          type="button"
          disabled={isPending}
          onClick={() => runAction(markCompleted)}
        >
          {isPending ? "Updating…" : "Mark completed"}
        </Button>
      ) : null}

      {status !== "ASSIGNED" && status !== "IN_PROGRESS" ? (
        <p className="text-small text-muted">
          No further worker actions on this complaint.
        </p>
      ) : null}
    </div>
  );
}
