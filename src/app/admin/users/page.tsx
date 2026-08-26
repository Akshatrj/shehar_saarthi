import { PageHeader } from "@/components/ui/PageHeader";
import { PaginationNav } from "@/components/ui/PaginationNav";
import { Card } from "@/components/ui/Card";
import { UserEditForm } from "@/components/admin/UserEditForm";
import { CreateWorkerForm } from "@/components/staff/CreateWorkerForm";
import { createWorkerAction } from "@/app/admin/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { listActiveDepartmentsForSelect } from "@/domains/admin/departments";
import { listAdminUsers } from "@/domains/admin/users";
import { requireSuperAdmin } from "@/lib/auth/require";
import { roleLabel } from "@/lib/rbac";

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const actor = await requireSuperAdmin();
  const params = await searchParams;
  const page = Number(params.page) > 0 ? Number(params.page) : 1;

  const [{ users, hasMore }, departments] = await Promise.all([
    listAdminUsers(actor, page),
    listActiveDepartmentsForSelect(actor),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Super Admin"
        title="Users"
        description="Add workers, then change roles, departments, and account status."
      />

      <Card className="p-5">
        <h2 className="text-h3 text-navy">Add worker</h2>
        <p className="mt-1 text-small text-muted">
          Same as department admin: name, email, and password. You choose which
          department the worker belongs to.
        </p>
        <div className="mt-4">
          {departments.length > 0 ? (
            <CreateWorkerForm action={createWorkerAction} departments={departments} />
          ) : (
            <p className="text-small text-muted">
              Create an active department before adding workers.
            </p>
          )}
        </div>
      </Card>

      <Table caption="Platform users">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Manage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{roleLabel(user.role)}</TableCell>
              <TableCell>{user.department?.name ?? "—"}</TableCell>
              <TableCell>{user.isActive ? "Active" : "Inactive"}</TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell className="min-w-[16rem]">
                <UserEditForm user={user} departments={departments} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PaginationNav page={page} hasMore={hasMore} basePath="/admin/users" />
    </div>
  );
}
