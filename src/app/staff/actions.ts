"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/require";
import {
  assignComplaintToSelf,
  completeStaffComplaint,
  requireStaffContext,
  StaffComplaintError,
  startComplaintProgress,
  type StaffContext,
} from "@/domains/complaints/staff-service";

export type StaffActionResult = { ok: true } | { ok: false; error: string };

function failure(message: string): StaffActionResult {
  return { ok: false, error: message };
}

function revalidateStaffComplaint(complaintId: string) {
  revalidatePath("/staff");
  revalidatePath(`/staff/complaints/${complaintId}`);
}

async function runStaffAction(
  complaintId: string,
  action: (staff: StaffContext) => Promise<void>,
): Promise<StaffActionResult> {
  try {
    const user = await requireStaff();
    if (!complaintId?.trim()) {
      return failure("Complaint id is required.");
    }
    const staff = requireStaffContext(user);
    await action(staff);
    revalidateStaffComplaint(complaintId.trim());
    return { ok: true };
  } catch (error) {
    if (error instanceof StaffComplaintError) {
      return failure(error.message);
    }
    console.error("staff action failed", error);
    return failure("Could not update the complaint. Please try again.");
  }
}

export async function assignToSelf(complaintId: string): Promise<StaffActionResult> {
  return runStaffAction(complaintId, (staff) =>
    assignComplaintToSelf(staff, complaintId.trim()),
  );
}

export async function startProgress(complaintId: string): Promise<StaffActionResult> {
  return runStaffAction(complaintId, (staff) =>
    startComplaintProgress(staff, complaintId.trim()),
  );
}

export async function markCompleted(
  complaintId: string,
): Promise<StaffActionResult> {
  return runStaffAction(complaintId, (staff) =>
    completeStaffComplaint(staff, complaintId.trim()),
  );
}
