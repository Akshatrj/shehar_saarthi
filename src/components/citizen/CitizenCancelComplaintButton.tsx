"use client";

import { DeleteComplaintButton } from "@/components/complaints/DeleteComplaintButton";

export function CitizenCancelComplaintButton({
  complaintId,
}: {
  complaintId: string;
}) {
  return (
    <DeleteComplaintButton
      label="Cancel complaint"
      pendingLabel="Cancelling…"
      confirmMessage="Cancel this complaint? It will be permanently deleted and will disappear from staff queues."
      redirectTo="/citizen?canceled=1"
      appearance="soft-cancel"
      onConfirm={async () => {
        const response = await fetch(`/api/v1/complaints/${complaintId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          return { ok: true };
        }
        const payload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        return {
          ok: false,
          error: payload?.message ?? "Could not cancel this complaint.",
        };
      }}
    />
  );
}
