import type { Metadata } from "next";
import { AuthenticatedShell } from "@/components/layout/AuthenticatedShell";
import { PRIVATE_PAGE_ROBOTS } from "@/lib/app-origin";
import { requireCitizen } from "@/lib/auth/require";

export const metadata: Metadata = {
  title: "Citizen portal",
  robots: PRIVATE_PAGE_ROBOTS,
};

export default async function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCitizen();

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
