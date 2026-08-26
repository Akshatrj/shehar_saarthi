import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CitizenLoginForm } from "@/components/auth/CitizenLoginForm";
import { Logo } from "@/components/layout/Logo";
import { PublicPage } from "@/components/layout/PublicPage";
import { Alert } from "@/components/ui/Alert";
import { safeAuthCallbackUrl } from "@/lib/auth-callback";
import { auth } from "@/lib/auth";
import { isGoogleAuthConfigured } from "@/lib/auth-env";
import { portalPathForRole } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const session = await auth();

  if (session?.user?.id && session.user.isActive !== false) {
    redirect(portalPathForRole(session.user.role));
  }

  const callbackUrl = safeAuthCallbackUrl(params.callbackUrl);
  const googleConfigured = isGoogleAuthConfigured();

  return (
    <PublicPage>
      <div className="mx-auto flex max-w-md flex-col items-center py-8 sm:py-14">
        <Logo variant="lockup" href="/" surface="light" priority className="w-40 sm:w-44" />

        <div className="mt-8 flex w-full flex-col items-center gap-4">
          {params.error === "inactive" ? (
            <Alert variant="danger" title="Account inactive">
              Your account has been deactivated. Contact your municipality
              administrator.
            </Alert>
          ) : null}
          {params.error === "CredentialsSignin" ? (
            <Alert variant="danger" title="Sign-in failed">
              Email or password is incorrect.
            </Alert>
          ) : null}
          {params.error === "OAuthAccountNotLinked" ? (
            <Alert variant="danger" title="Sign-in failed">
              This Google account could not be linked. Try again or use another
              account.
            </Alert>
          ) : null}
          {params.error === "database" ? (
            <Alert variant="danger" title="Could not finish sign-in">
              Google accepted your account, but the database is not reachable
              right now. If this is a Neon project, wake the compute in the Neon
              dashboard and try again.
            </Alert>
          ) : null}
          {params.error === "Configuration" ? (
            <Alert variant="danger" title="Sign-in is not configured">
              Check Google OAuth settings, or try email and password again.
            </Alert>
          ) : null}

          <CitizenLoginForm
            callbackUrl={callbackUrl}
            googleConfigured={googleConfigured}
          />
        </div>

        <p className="mt-6 text-center text-small text-muted">
          By continuing you agree to our{" "}
          <Link href="/terms" className="text-brand underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-brand underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </PublicPage>
  );
}
