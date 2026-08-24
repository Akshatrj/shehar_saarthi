import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { requireStaff } from "@/lib/auth/require";

export default async function StaffHomePage() {
  const user = await requireStaff();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Staff"
        title="Department desk"
        description="Staff workflows will be added in a later phase."
      />
      <Card className="p-5">
        <CardTitle>{user.name ?? user.email}</CardTitle>
        <CardDescription className="mt-2">
          Role: {user.role}
          {user.departmentId
            ? " · Assigned to a department"
            : " · No department assigned yet"}
        </CardDescription>
      </Card>
    </div>
  );
}
