import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import {
  CreateDepartmentForm,
  EditDepartmentForm,
} from "@/components/admin/DepartmentForms";
import { CategoryRoutingForm } from "@/components/admin/CategoryRoutingForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  listAdminDepartments,
  listCategoryRouting,
} from "@/domains/admin/departments";
import { requireSuperAdmin } from "@/lib/auth/require";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminDepartmentsPage() {
  const actor = await requireSuperAdmin();
  const [departments, routes] = await Promise.all([
    listAdminDepartments(actor),
    listCategoryRouting(actor),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Super Admin"
        title="Departments"
        description="Rename, activate, and route complaint categories to departments. Relationships use department ID, so a rename does not break existing complaints or admins."
      />

      <Card className="p-5">
        <h2 className="text-h3 text-navy">Create department</h2>
        <div className="mt-4 max-w-md">
          <CreateDepartmentForm />
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-h3 text-navy">Category routing</h2>
        <p className="mt-1 text-small text-muted">
          Each complaint type is assigned to a department by ID. Changing a
          department name keeps this mapping.
        </p>
        <div className="mt-4">
          <CategoryRoutingForm routes={routes} departments={departments} />
        </div>
      </Card>

      <Table caption="Departments">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Edit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((department) => (
            <TableRow key={department.id}>
              <TableCell>{department.name}</TableCell>
              <TableCell className="font-mono">{department.code}</TableCell>
              <TableCell>{department.isActive ? "Active" : "Inactive"}</TableCell>
              <TableCell>{formatDate(department.createdAt)}</TableCell>
              <TableCell className="min-w-[16rem]">
                <EditDepartmentForm department={department} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
