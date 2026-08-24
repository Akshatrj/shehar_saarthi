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
        <>
          <ButtonLink
            href="/login"
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            Sign in
          </ButtonLink>
          <ButtonLink href="/login" size="sm">
            <span className="sm:hidden">Sign in</span>
            <span className="hidden sm:inline">Sign in</span>
          </ButtonLink>
        </>
      }
    >
      {children}
    </PublicShell>
  );
}
