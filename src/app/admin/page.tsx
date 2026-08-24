import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { requireSuperAdmin } from "@/lib/auth/require";
import { getAdminDashboardStats } from "@/domains/admin/users";

export default async function AdminHomePage() {
  const user = await requireSuperAdmin();
  const stats = await getAdminDashboardStats(user);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Super Admin"
        title="Municipal control"
        description="Manage users, departments, and complaints across the platform."
      />
      <Card className="p-5">
        <CardTitle>{user.name ?? user.email}</CardTitle>
        <CardDescription className="mt-2">
          Role: {user.role} · Full platform access
        </CardDescription>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-4">
          <p className="text-small text-muted">Users</p>
          <p className="mt-1 text-h2 text-navy">{stats.totalUsers}</p>
        </Card>
        <Card className="p-4">
          <p className="text-small text-muted">Citizens</p>
          <p className="mt-1 text-h2 text-navy">{stats.citizens}</p>
        </Card>
        <Card className="p-4">
          <p className="text-small text-muted">Workers</p>
          <p className="mt-1 text-h2 text-navy">{stats.workers}</p>
        </Card>
        <Card className="p-4">
          <p className="text-small text-muted">Dept admins</p>
          <p className="mt-1 text-h2 text-navy">{stats.departmentAdmins}</p>
        </Card>
        <Card className="p-4">
          <p className="text-small text-muted">Departments</p>
          <p className="mt-1 text-h2 text-navy">{stats.departments}</p>
        </Card>
        <Card className="p-4">
          <p className="text-small text-muted">Complaints</p>
          <p className="mt-1 text-h2 text-navy">{stats.totalComplaints}</p>
        </Card>
        <Card className="p-4">
          <p className="text-small text-muted">Open</p>
          <p className="mt-1 text-h2 text-navy">{stats.openComplaints}</p>
        </Card>
        <Card className="p-4">
          <p className="text-small text-muted">Completed/closed</p>
          <p className="mt-1 text-h2 text-navy">{stats.completedComplaints}</p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <CardTitle>Users</CardTitle>
          <CardDescription className="mt-2">
            Manage roles, departments, and account status.
          </CardDescription>
          <Link href="/admin/users" className="mt-3 inline-block text-small font-medium text-brand">
            Open users
          </Link>
        </Card>
        <Card className="p-5">
          <CardTitle>Departments</CardTitle>
          <CardDescription className="mt-2">
            Create and maintain municipal departments.
          </CardDescription>
          <Link
            href="/admin/departments"
            className="mt-3 inline-block text-small font-medium text-brand"
          >
            Open departments
          </Link>
        </Card>
        <Card className="p-5">
          <CardTitle>Complaints</CardTitle>
          <CardDescription className="mt-2">
            View all complaints and apply administrative overrides.
          </CardDescription>
          <Link
            href="/admin/complaints"
            className="mt-3 inline-block text-small font-medium text-brand"
          >
            Open complaints
          </Link>
        </Card>
      </div>
    </div>
  );
}
