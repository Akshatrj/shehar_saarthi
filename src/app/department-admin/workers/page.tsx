import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { CreateWorkerForm } from "@/components/staff/CreateWorkerForm";
import { createWorker } from "@/app/department-admin/actions";
import { DepartmentWorkerTable } from "@/components/department-admin/DepartmentWorkerTable";
import {
  getDepartmentAdminDepartment,
  listDepartmentWorkers,
  requireDepartmentAdminContext,
} from "@/domains/complaints/department-admin-service";
import { requireDepartmentAdmin } from "@/lib/auth/require";

export default async function DepartmentAdminWorkersPage() {
  const user = await requireDepartmentAdmin();
  const admin = requireDepartmentAdminContext(user);
  const [workers, department] = await Promise.all([
    listDepartmentWorkers(admin.departmentId),
    getDepartmentAdminDepartment(admin.departmentId),
  ]);
  const departmentName = department?.name ?? "your department";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Department admin"
        title="Workers"
        description={`Add and manage field workers for ${departmentName}.`}
        actions={
          <Link href="/department-admin" className="text-small font-medium text-brand">
            Back to desk
          </Link>
        }
      />

      <Card className="p-5">
        <h2 className="text-h3 text-navy">Add worker</h2>
        <p className="mt-1 text-small text-muted">
          New workers can only see and work complaints routed to {departmentName}.
        </p>
        <div className="mt-4">
          <CreateWorkerForm
            action={createWorker}
            lockedDepartmentName={departmentName}
          />
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-h3 text-navy">Department workers</h2>
        <p className="mt-1 mb-4 text-small text-muted">
          Deactivate a worker to stop new assignments. Existing work stays on
          their desk until reassigned.
        </p>
        <DepartmentWorkerTable workers={workers} />
      </Card>
    </div>
  );
}
