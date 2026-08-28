"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/require";
import {
  createAdminDepartment,
  updateAdminDepartment,
  updateCategoryRouting,
} from "@/domains/admin/departments";
import {
  overrideAdminComplaint,
  routeAdminComplaintWithAi,
  acceptRoutingRecommendation,
  assignDepartmentManually,
  autoRouteAllComplaints,
  deleteAdminComplaint,
} from "@/domains/admin/complaints";
import { AdminError } from "@/domains/admin/auth";

export type AdminActionResult =
  | { ok: true; summary?: { processed: number; routed: number; manualRequired: number } }
  | { ok: false; error: string };

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

export async function createDepartmentAction(
  formData: FormData,
): Promise<AdminActionResult> {
  return runAdminAction(
    (actor) =>
      createAdminDepartment(actor, {
        name: formData.get("name"),
        code: formData.get("code"),
        description: formData.get("description"),
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
        description: formData.get("description"),
        isActive: formData.get("isActive"),
      }),
    ["/admin/departments"],
  );
}

export async function updateCategoryRoutingAction(
  formData: FormData,
): Promise<AdminActionResult> {
  const assignments = [...formData.entries()]
    .filter(([key]) => key.startsWith("route_"))
    .map(([key, value]) => ({
      category: key.slice("route_".length),
      departmentId: typeof value === "string" ? value : "",
    }));

  return runAdminAction(
    (actor) => updateCategoryRouting(actor, assignments),
    ["/admin/departments"],
  );
}

export async function routeWithAiAction(
  complaintId: string,
): Promise<AdminActionResult> {
  return runAdminAction(
    (actor) => routeAdminComplaintWithAi(actor, complaintId),
    ["/admin/complaints", `/admin/complaints/${complaintId}`, "/admin/ai"],
  );
}

export async function acceptRoutingRecommendationAction(
  complaintId: string,
): Promise<AdminActionResult> {
  return runAdminAction(
    (actor) => acceptRoutingRecommendation(actor, complaintId),
    ["/admin/complaints", `/admin/complaints/${complaintId}`],
  );
}

export async function assignDepartmentAction(
  complaintId: string,
  input: { departmentId: string; reason?: string },
): Promise<AdminActionResult> {
  return runAdminAction(
    (actor) =>
      assignDepartmentManually(actor, complaintId, {
        departmentId: input.departmentId,
        reason: input.reason,
      }),
    ["/admin/complaints", `/admin/complaints/${complaintId}`],
  );
}

export async function autoRouteAllAction(): Promise<AdminActionResult> {
  try {
    const actor = await requireSuperAdmin();
    const summary = await autoRouteAllComplaints(actor);
    revalidatePath("/admin/complaints");
    revalidatePath("/admin");
    return { ok: true, summary };
  } catch (error) {
    if (error instanceof AdminError) {
      return failure(error.message);
    }
    console.error("admin action failed", error);
    return failure("Action failed. Please try again.");
  }
}

export async function deleteComplaintAction(
  complaintId: string,
): Promise<AdminActionResult> {
  if (!complaintId?.trim()) {
    return failure("Complaint id is required.");
  }
  return runAdminAction(
    (actor) => deleteAdminComplaint(actor, complaintId.trim()),
    ["/admin/complaints", "/admin", "/department-admin", "/citizen"],
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
