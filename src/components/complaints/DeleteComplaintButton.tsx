"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

type DeleteComplaintButtonProps = {
  label: string;
  pendingLabel: string;
  confirmMessage: string;
  redirectTo: string;
  onConfirm: () => Promise<{ ok: boolean; error?: string }>;
};

export function DeleteComplaintButton({
  label,
  pendingLabel,
  confirmMessage,
  redirectTo,
  onConfirm,
}: DeleteComplaintButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function runConfirm() {
    if (!window.confirm(confirmMessage)) {
      return;
    }
    startTransition(async () => {
      const result = await onConfirm();
      if (!result.ok) {
        setError(result.error ?? "Could not delete this complaint.");
        return;
      }
      router.push(redirectTo);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error ? (
        <Alert variant="danger" live="assertive">
          {error}
        </Alert>
      ) : null}
      <Button
        type="button"
        variant="dangerSoft"
        className="w-full"
        disabled={isPending}
        onClick={runConfirm}
      >
        {isPending ? pendingLabel : label}
      </Button>
    </div>
  );
}
