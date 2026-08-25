import type { ReactNode } from "react";
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  FolderOpen,
  Shield,
  UserCog,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { roleLabel } from "@/lib/rbac";
import type { AuthUser } from "@/lib/rbac";

export type AdminDashboardStats = {
  totalUsers: number;
  citizens: number;
  workers: number;
  departmentAdmins: number;
  departments: number;
  totalComplaints: number;
  openComplaints: number;
  completedComplaints: number;
};

function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function AdminIdentityChip({ user }: { user: AuthUser }) {
  return (
    <div className="inline-flex max-w-full items-center gap-2.5 rounded-lg border border-line bg-paper-raised px-2.5 py-2 shadow-sm">
      <span
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white"
        aria-hidden
      >
        {initials(user.name, user.email)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-small font-semibold leading-tight text-navy">
          {user.name ?? user.email}
        </p>
        <p className="truncate text-xs text-muted">Full platform access</p>
      </div>
      <Badge tone="blue" className="shrink-0 gap-1 normal-case tracking-normal">
        <Shield className="h-3 w-3" aria-hidden />
        {roleLabel(user.role)}
      </Badge>
    </div>
  );
}

function MetricGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-small font-semibold text-navy">{title}</h2>
        <p className="mt-0.5 text-xs text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function AdminDashboardMetrics({ stats }: { stats: AdminDashboardStats }) {
  const workloadTotal = stats.openComplaints + stats.completedComplaints;
  const resolvedShare =
    workloadTotal === 0
      ? 0
      : Math.round((stats.completedComplaints / workloadTotal) * 100);

  return (
    <div className="flex flex-col gap-6">
      <MetricGroup
        title="People"
        description="Accounts across the municipal platform."
      >
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard
            label="Users"
            value={stats.totalUsers}
            hint="All platform accounts"
            href="/admin/users"
            icon={Users}
            tone="brand"
          />
          <StatCard
            label="Citizens"
            value={stats.citizens}
            hint="Reporting residents"
            icon={UserRound}
          />
          <StatCard
            label="Workers"
            value={stats.workers}
            hint="Field staff"
            icon={Wrench}
          />
          <StatCard
            label="Dept admins"
            value={stats.departmentAdmins}
            hint="Department desks"
            icon={UserCog}
          />
        </div>
      </MetricGroup>

      <div className="grid gap-6 xl:grid-cols-2">
        <MetricGroup
          title="Operations"
          description="Municipal structure and reported issues."
        >
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Departments"
              value={stats.departments}
              hint="Active municipal units"
              href="/admin/departments"
              icon={Building2}
              tone="brand"
            />
            <StatCard
              label="Complaints"
              value={stats.totalComplaints}
              hint="All-time filings"
              href="/admin/complaints"
              icon={ClipboardList}
            />
          </div>
        </MetricGroup>

        <MetricGroup
          title="Workload"
          description={
            workloadTotal === 0
              ? "No complaints in the pipeline yet."
              : `${resolvedShare}% of tracked complaints are completed or closed.`
          }
        >
          <div
            className="h-1.5 overflow-hidden rounded-full bg-warning-bg"
            role="img"
            aria-label={`${resolvedShare}% completed or closed`}
          >
            <div
              className="h-full rounded-full bg-success"
              style={{ width: `${resolvedShare}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Open"
              value={stats.openComplaints}
              hint="Still in the pipeline"
              href="/admin/complaints"
              icon={FolderOpen}
              tone="warning"
            />
            <StatCard
              label="Completed"
              value={stats.completedComplaints}
              hint="Completed or closed"
              icon={CheckCircle2}
              tone="success"
            />
          </div>
        </MetricGroup>
      </div>
    </div>
  );
}
