import type { Metadata } from "next";
import { AuthenticatedShell } from "@/components/layout/AuthenticatedShell";
import { requireDepartmentAdmin } from "@/lib/auth/require";

export const metadata: Metadata = {
  title: "Department admin",
};

export default async function DepartmentAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireDepartmentAdmin();

  return (
    <AuthenticatedShell
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
      }}
    >
      {children}
    </AuthenticatedShell>
  );
}
