"use client";

import { deleteComplaintAction } from "@/app/admin/actions";
import { DeleteComplaintButton } from "@/components/complaints/DeleteComplaintButton";

export function AdminDeleteComplaintButton({
  complaintId,
}: {
  complaintId: string;
}) {
  return (
    <DeleteComplaintButton
      label="Delete complaint"
      pendingLabel="Deleting…"
      confirmMessage="Delete this complaint permanently? It will disappear from every queue and the photo will be removed."
      redirectTo="/admin/complaints"
      onConfirm={() => deleteComplaintAction(complaintId)}
    />
  );
}
