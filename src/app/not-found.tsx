import { ButtonLink } from "@/components/ui/Button";
import { PUBLIC_REPORT_HREF } from "@/lib/public-routes";
import { PublicShell } from "@/components/layout/PublicShell";
import { PublicPage } from "@/components/layout/PublicPage";

export default function NotFound() {
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
          <ButtonLink href={PUBLIC_REPORT_HREF} size="sm">
            Report an issue
          </ButtonLink>
        </>
      }
    >
      <PublicPage>
        <div className="mx-auto max-w-lg py-10 sm:py-16">
          <p className="text-small font-medium text-green-800">404</p>
          <h1 className="mt-2 text-h1 text-green-950">Page not found</h1>
          <p className="mt-2 text-body text-muted">
            This address is not part of SheharSaarthi. Check the link or return
            home.
          </p>
          <div className="mt-6">
            <ButtonLink href="/">Back to home</ButtonLink>
          </div>
        </div>
      </PublicPage>
    </PublicShell>
  );
}
