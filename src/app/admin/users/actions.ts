"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/require";
import { canAccessAdminPortal } from "@/lib/rbac";
import type { AuthUser } from "@/lib/rbac";
import {
  updateAdminUser,
  createAdminWorker,
  deleteAdminUser,
} from "@/domains/admin/users";
import { AdminError } from "@/domains/admin/auth";

export type UserAdminActionResult =
  | { ok: true }
  | { ok: false; error: string };

function failure(message: string): UserAdminActionResult {
  return { ok: false, error: message };
}

async function runUserAdminAction(
  action: (actor: AuthUser) => Promise<void>,
  paths: string[] = ["/admin/users"],
): Promise<UserAdminActionResult> {
  try {
    const actor = await getAuthUser();
    if (!actor) {
      return failure("Please sign in to continue.");
    }
    if (!canAccessAdminPortal(actor.role)) {
      return failure("Super admin access is required.");
    }
    await action(actor);
    for (const path of paths) {
      revalidatePath(path);
    }
    return { ok: true };
  } catch (error) {
    if (error instanceof AdminError) {
      return failure(error.message);
    }
    console.error("user admin action failed", error);
    return failure("Action failed. Please try again.");
  }
}

export async function updateUserAction(
  userId: string,
  formData: FormData,
): Promise<UserAdminActionResult> {
  return runUserAdminAction((actor) =>
    updateAdminUser(actor, userId, {
      role: formData.get("role"),
      departmentId: formData.get("departmentId"),
      isActive: formData.get("isActive"),
    }),
  );
}

export async function deleteUserAction(
  userId: string,
): Promise<UserAdminActionResult> {
  return runUserAdminAction(
    (actor) => deleteAdminUser(actor, userId),
    ["/admin/users", "/admin"],
  );
}

export async function createWorkerAction(
  formData: FormData,
): Promise<UserAdminActionResult> {
  return runUserAdminAction(
    async (actor) => {
      await createAdminWorker(actor, {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
        departmentId: formData.get("departmentId"),
      });
    },
    ["/admin/users", "/department-admin", "/department-admin/workers"],
  );
}
