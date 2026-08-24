"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/require";
import {
  createAdminDepartment,
  updateAdminDepartment,
} from "@/domains/admin/departments";
import { overrideAdminComplaint } from "@/domains/admin/complaints";
import { updateAdminUser } from "@/domains/admin/users";
import { AdminError } from "@/domains/admin/auth";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

function failure(message: string): AdminActionResult {
  return { ok: false, error: message };
}

async function runAdminAction(
  action: (actor: Awaited<ReturnType<typeof requireSuperAdmin>>) => Promise<void>,
  paths: string[],
): Promise<AdminActionResult> {
  try {
    const actor = await requireSuperAdmin();
    await action(actor);
    for (const path of paths) {
      revalidatePath(path);
    }
    return { ok: true };
  } catch (error) {
    if (error instanceof AdminError) {
      return failure(error.message);
    }
    console.error("admin action failed", error);
    return failure("Action failed. Please try again.");
  }
}

export async function updateUserAction(
  userId: string,
  formData: FormData,
): Promise<AdminActionResult> {
  return runAdminAction(
    (actor) =>
      updateAdminUser(actor, userId, {
        role: formData.get("role"),
        departmentId: formData.get("departmentId"),
        isActive: formData.get("isActive"),
      }),
    ["/admin/users"],
  );
}

export async function createDepartmentAction(
  formData: FormData,
): Promise<AdminActionResult> {
  return runAdminAction(
    (actor) =>
      createAdminDepartment(actor, {
        name: formData.get("name"),
        code: formData.get("code"),
      }),
    ["/admin/departments"],
  );
}

export async function updateDepartmentAction(
  departmentId: string,
  formData: FormData,
): Promise<AdminActionResult> {
  return runAdminAction(
    (actor) =>
      updateAdminDepartment(actor, departmentId, {
        name: formData.get("name"),
        code: formData.get("code"),
        isActive: formData.get("isActive"),
      }),
    ["/admin/departments"],
  );
}

export async function overrideComplaintAction(
  complaintId: string,
  formData: FormData,
): Promise<AdminActionResult> {
  return runAdminAction(
    (actor) =>
      overrideAdminComplaint(actor, complaintId, {
        category: formData.get("category"),
        departmentId: formData.get("departmentId"),
      }),
    ["/admin/complaints", `/admin/complaints/${complaintId}`],
  );
}
