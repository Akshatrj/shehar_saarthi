"use server";

import { revalidatePath } from "next/cache";
import { requireDepartmentAdmin } from "@/lib/auth/require";
import {
  assignComplaintToWorker,
  closeDepartmentComplaint,
  createDepartmentWorker,
  deleteDepartmentComplaint,
  requireDepartmentAdminContext,
  setDepartmentWorkerActive,
  DepartmentAdminError,
  type DepartmentAdminContext,
} from "@/domains/complaints/department-admin-service";

export type DepartmentAdminActionResult =
  | { ok: true }
  | { ok: false; error: string };

function failure(message: string): DepartmentAdminActionResult {
  return { ok: false, error: message };
}

function revalidateDepartmentPaths(complaintId?: string) {
  revalidatePath("/department-admin");
  revalidatePath("/department-admin/workers");
  revalidatePath("/worker");
  if (complaintId) {
    revalidatePath(`/department-admin/complaints/${complaintId}`);
    revalidatePath(`/worker/complaints/${complaintId}`);
  }
}

async function runAdminAction(
  action: (admin: DepartmentAdminContext) => Promise<void>,
  complaintId?: string,
): Promise<DepartmentAdminActionResult> {
  try {
    const user = await requireDepartmentAdmin();
    const admin = requireDepartmentAdminContext(user);
    await action(admin);
    revalidateDepartmentPaths(complaintId);
    return { ok: true };
  } catch (error) {
    if (error instanceof DepartmentAdminError) {
      return failure(error.message);
    }
    console.error("department admin action failed", error);
    return failure("Could not complete the action. Please try again.");
  }
}

export async function assignWorker(
  complaintId: string,
  workerId: string,
): Promise<DepartmentAdminActionResult> {
  if (!complaintId?.trim() || !workerId?.trim()) {
    return failure("Complaint and worker are required.");
  }
  return runAdminAction(
    (admin) => assignComplaintToWorker(admin, complaintId.trim(), workerId.trim()),
    complaintId.trim(),
  );
}

export async function closeComplaint(
  complaintId: string,
): Promise<DepartmentAdminActionResult> {
  if (!complaintId?.trim()) {
    return failure("Complaint id is required.");
  }
  return runAdminAction(
    (admin) => closeDepartmentComplaint(admin, complaintId.trim()),
    complaintId.trim(),
  );
}

export async function deleteComplaint(
  complaintId: string,
): Promise<DepartmentAdminActionResult> {
  if (!complaintId?.trim()) {
    return failure("Complaint id is required.");
  }
  return runAdminAction(
    (admin) => deleteDepartmentComplaint(admin, complaintId.trim()),
    complaintId.trim(),
  );
}

export async function deactivateWorker(
  workerId: string,
): Promise<DepartmentAdminActionResult> {
  if (!workerId?.trim()) {
    return failure("Worker id is required.");
  }
  return runAdminAction((admin) =>
    setDepartmentWorkerActive(admin, workerId.trim(), false),
  );
}

export async function activateWorker(
  workerId: string,
): Promise<DepartmentAdminActionResult> {
  if (!workerId?.trim()) {
    return failure("Worker id is required.");
  }
  return runAdminAction((admin) =>
    setDepartmentWorkerActive(admin, workerId.trim(), true),
  );
}

export async function createWorker(
  formData: FormData,
): Promise<DepartmentAdminActionResult> {
  const result = await runAdminAction(async (admin) => {
    await createDepartmentWorker(admin, {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    });
  });
  if (result.ok) {
    revalidatePath("/admin/users");
  }
  return result;
}
