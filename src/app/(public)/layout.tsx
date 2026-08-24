import { PublicShell } from "@/components/layout/PublicShell";
import { ButtonLink } from "@/components/ui/Button";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicShell
      actions={
        <ButtonLink href="/login" size="sm">
          Sign in
        </ButtonLink>
      }
    >
      {children}
    </PublicShell>
  );
}
