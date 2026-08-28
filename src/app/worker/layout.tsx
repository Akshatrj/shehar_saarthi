import type { Metadata } from "next";
import { AuthenticatedShell } from "@/components/layout/AuthenticatedShell";
import { PRIVATE_PAGE_ROBOTS } from "@/lib/app-origin";
import { requireWorker } from "@/lib/auth/require";

export const metadata: Metadata = {
  title: "Worker portal",
  robots: PRIVATE_PAGE_ROBOTS,
};

export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireWorker();

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
