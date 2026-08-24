import type { Metadata } from "next";
import { AuthenticatedShell } from "@/components/layout/AuthenticatedShell";
import { requireCitizenPortal } from "@/lib/auth/require";

export const metadata: Metadata = {
  title: "Citizen portal",
};

export default async function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCitizenPortal();

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
