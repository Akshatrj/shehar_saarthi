import type { Metadata } from "next";
import { AuthenticatedShell } from "@/components/layout/AuthenticatedShell";
import { AdminShell } from "@/components/admin/AdminShell";
import { PRIVATE_PAGE_ROBOTS } from "@/lib/app-origin";
import { requireSuperAdmin } from "@/lib/auth/require";

export const metadata: Metadata = {
  title: "Admin portal",
  robots: PRIVATE_PAGE_ROBOTS,
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSuperAdmin();

  return (
    <AuthenticatedShell
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
      }}
    >
      <AdminShell>{children}</AdminShell>
    </AuthenticatedShell>
  );
}
