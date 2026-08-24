import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { requireCitizenPortal } from "@/lib/auth/require";

export default async function CitizenHomePage() {
  const user = await requireCitizenPortal();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Citizen"
        title="Welcome"
        description="Your account is ready. Complaint reporting will be added in the next phase."
      />
      <Card className="p-5">
        <CardTitle>Signed in as {user.name ?? user.email}</CardTitle>
        <CardDescription className="mt-2">
          Role: {user.role}
          {user.departmentId ? ` · Department linked` : ""}
        </CardDescription>
      </Card>
    </div>
  );
}
