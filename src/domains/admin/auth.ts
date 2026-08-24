import type { AuthUser } from "@/lib/rbac";

export class AdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminError";
  }
}

export function assertSuperAdmin(actor: AuthUser) {
  if (actor.role !== "SUPER_ADMIN") {
    throw new AdminError("Super admin access is required.");
  }
}

export const ADMIN_PAGE_SIZE = 20;
