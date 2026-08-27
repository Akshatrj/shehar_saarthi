import { PageHeader } from "@/components/ui/PageHeader";
import { PaginationNav } from "@/components/ui/PaginationNav";
import { Card } from "@/components/ui/Card";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { CreateWorkerForm } from "@/components/staff/CreateWorkerForm";
import { createWorkerAction } from "@/app/admin/users/actions";
import { listActiveDepartmentsForSelect } from "@/domains/admin/departments";
import { listAdminUsers } from "@/domains/admin/users";
import { requireSuperAdmin } from "@/lib/auth/require";

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

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

      <AdminUsersTable
        users={users}
        departments={departments}
        currentUserId={actor.id}
      />

      <PaginationNav page={page} hasMore={hasMore} basePath="/admin/users" />
    </div>
  );
}
