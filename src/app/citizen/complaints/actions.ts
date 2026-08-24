"use server";

import { revalidatePath } from "next/cache";
import { requireCitizenPortal } from "@/lib/auth/require";
import {
  CategoryConfirmationError,
  changeCitizenCategory,
  confirmCitizenCategory,
} from "@/domains/complaints/category-confirmation";
import { CategoryRoutingError } from "@/domains/complaints/routing";

export type CategoryActionResult =
  | { ok: true }
  | { ok: false; error: string };

function failure(message: string): CategoryActionResult {
  return { ok: false, error: message };
}

function revalidateComplaint(complaintId: string) {
  revalidatePath("/citizen");
  revalidatePath(`/citizen/complaints/${complaintId}`);
}

export async function confirmCategory(
  complaintId: string,
): Promise<CategoryActionResult> {
  try {
    const user = await requireCitizenPortal();
    if (!complaintId?.trim()) {
      return failure("Complaint id is required.");
    }
    await confirmCitizenCategory(user, complaintId.trim());
    revalidateComplaint(complaintId.trim());
    return { ok: true };
  } catch (error) {
    if (error instanceof CategoryConfirmationError) {
      return failure(error.message);
    }
    if (error instanceof CategoryRoutingError) {
      return failure(error.message);
    }
    console.error("confirmCategory failed", error);
    return failure("Could not confirm the category. Please try again.");
  }
}

export async function changeCategory(
  complaintId: string,
  category: string,
  departmentSlug?: string,
): Promise<CategoryActionResult> {
  try {
    const user = await requireCitizenPortal();
    if (!complaintId?.trim()) {
      return failure("Complaint id is required.");
    }
    await changeCitizenCategory(
      user,
      complaintId.trim(),
      category,
      departmentSlug,
    );
    revalidateComplaint(complaintId.trim());
    return { ok: true };
  } catch (error) {
    if (error instanceof CategoryConfirmationError) {
      return failure(error.message);
    }
    if (error instanceof CategoryRoutingError) {
      return failure(error.message);
    }
    console.error("changeCategory failed", error);
    return failure("Could not update the category. Please try again.");
  }
}
