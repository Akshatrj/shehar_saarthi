import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { DepartmentWorkerTable } from "@/components/department-admin/DepartmentWorkerTable";
import {
  listDepartmentWorkers,
  requireDepartmentAdminContext,
} from "@/domains/complaints/department-admin-service";
import { requireDepartmentAdmin } from "@/lib/auth/require";

export default async function DepartmentAdminWorkersPage() {
  const user = await requireDepartmentAdmin();
  const admin = requireDepartmentAdminContext(user);
  const workers = await listDepartmentWorkers(admin.departmentId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Department admin"
        title="Workers"
        description="View and deactivate workers in your department."
        actions={
          <Link href="/department-admin" className="text-small font-medium text-brand">
            Back to desk
          </Link>
        }
      />

      <Card className="p-5">
        <DepartmentWorkerTable workers={workers} />
      </Card>
    </div>
  );
}
