"use server";

import { revalidatePath } from "next/cache";
import { requireCitizen } from "@/lib/auth/require";
import {
  ComplaintServiceError,
  reopenCitizenComplaint,
} from "@/domains/complaints/service";

export type CategoryActionResult =
  | { ok: true }
  | { ok: false; error: string };

function failure(message: string): CategoryActionResult {
  return { ok: false, error: message };
}

function revalidateComplaint(complaintId: string) {
  revalidatePath("/citizen");
  revalidatePath(`/citizen/complaints/${complaintId}`);
  revalidatePath("/worker");
  revalidatePath("/department-admin");
}

export async function reopenComplaint(
  complaintId: string,
  formData: FormData,
): Promise<CategoryActionResult> {
  try {
    const user = await requireCitizen();
    if (!complaintId?.trim()) {
      return failure("Complaint id is required.");
    }
    await reopenCitizenComplaint(
      user,
      complaintId.trim(),
      formData.get("reason"),
    );
    revalidateComplaint(complaintId.trim());
    return { ok: true };
  } catch (error) {
    if (error instanceof ComplaintServiceError) {
      return failure(error.message);
    }
    console.error("reopenComplaint failed", error);
    return failure("Could not reopen this complaint. Please try again.");
  }
}
