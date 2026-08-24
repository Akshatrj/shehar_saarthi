import type { AuthUser } from "@/lib/rbac";
import { assertSuperAdmin } from "@/domains/admin/auth";
import {
  getDashboardAnalytics,
  type DashboardAnalytics,
} from "@/domains/complaints/dashboard-analytics";

export type { MapComplaintPin } from "@/domains/complaints/dashboard-analytics";

export async function getAdminDashboardAnalytics(
  actor: AuthUser,
): Promise<DashboardAnalytics> {
  assertSuperAdmin(actor);
  return getDashboardAnalytics({});
}
