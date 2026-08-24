import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import {
  CreateDepartmentForm,
  EditDepartmentForm,
} from "@/components/admin/DepartmentForms";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { listAdminDepartments } from "@/domains/admin/departments";
import { requireSuperAdmin } from "@/lib/auth/require";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminDepartmentsPage() {
  const actor = await requireSuperAdmin();
  const departments = await listAdminDepartments(actor);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Super Admin"
        title="Departments"
        description="Create, edit, and activate municipal departments."
      />

      <Card className="p-5">
        <h2 className="text-h3 text-navy">Create department</h2>
        <div className="mt-4 max-w-md">
          <CreateDepartmentForm />
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
