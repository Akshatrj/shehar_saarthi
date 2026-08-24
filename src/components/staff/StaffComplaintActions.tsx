"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  assignToSelf,
  markCompleted,
  startProgress,
} from "@/app/staff/actions";

type StaffComplaintActionsProps = {
  complaintId: string;
  status: string;
  assignedWorkerId: string | null;
  currentStaffId: string;
};

export function StaffComplaintActions({
  complaintId,
  status,
  assignedWorkerId,
  currentStaffId,
}: StaffComplaintActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isAssignedWorker = assignedWorkerId === currentStaffId;

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

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <Alert variant="danger" live="assertive">
          {error}
        </Alert>
      ) : null}

      {status === "ROUTED" ? (
        <Button
          type="button"
          disabled={isPending}
          onClick={() => runAction(assignToSelf)}
        >
          {isPending ? "Assigning…" : "Assign to myself"}
        </Button>
      ) : null}

      {status === "ASSIGNED" && isAssignedWorker ? (
        <Button
          type="button"
          disabled={isPending}
          onClick={() => runAction(startProgress)}
        >
          {isPending ? "Updating…" : "Start work"}
        </Button>
      ) : null}

      {status === "IN_PROGRESS" && isAssignedWorker ? (
        <Button
          type="button"
          disabled={isPending}
          onClick={() => runAction(markCompleted)}
        >
          {isPending ? "Updating…" : "Mark completed"}
        </Button>
      ) : null}
    </div>
  );
}
