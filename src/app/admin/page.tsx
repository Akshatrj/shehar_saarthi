import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { requireSuperAdmin } from "@/lib/auth/require";

export default async function AdminHomePage() {
  const user = await requireSuperAdmin();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Super Admin"
        title="Municipal control"
        description="User, department, and complaint management will arrive in later phases."
      />
      <Card className="p-5">
        <CardTitle>{user.name ?? user.email}</CardTitle>
        <CardDescription className="mt-2">
          Role: {user.role} · Full platform access
        </CardDescription>
      </Card>
    </div>
  );
}
