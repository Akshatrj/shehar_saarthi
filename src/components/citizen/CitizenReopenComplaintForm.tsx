"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reopenComplaint } from "@/app/citizen/complaints/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

export function CitizenReopenComplaintForm({
  complaintId,
  status,
}: {
  complaintId: string;
  status: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await reopenComplaint(complaintId, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      form.reset();
      setSuccess("Complaint reopened. The department will continue the work.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      {error ? (
        <Alert variant="danger" live="assertive">
          {error}
        </Alert>
      ) : null}
      {success ? <Alert variant="success">{success}</Alert> : null}
      <Alert variant="info">
        {status === "CLOSED"
          ? "This complaint was closed. If you are not satisfied, reopen it and explain what still needs fixing."
          : "Staff marked this work complete. If the problem remains, reopen it with a reason."}
      </Alert>
      <Textarea
        label="Reason for reopening"
        name="reason"
        required
        minLength={12}
        maxLength={400}
        disabled={isPending}
        hint="At least 12 characters. This is sent to the department and worker."
      />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Reopening…" : "Reopen complaint"}
      </Button>
    </form>
  );
}
