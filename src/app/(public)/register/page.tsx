import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CitizenRegisterForm } from "@/components/auth/CitizenRegisterForm";
import { Logo } from "@/components/layout/Logo";
import { PublicPage } from "@/components/layout/PublicPage";
import { Alert } from "@/components/ui/Alert";
import { safeAuthCallbackUrl } from "@/lib/auth-callback";
import { getAuthUser } from "@/lib/auth/require";
import { isGoogleAuthConfigured } from "@/lib/auth-env";
import { portalPathForRole } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Sign up",
};

type RegisterPageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const user = await getAuthUser();

  if (user) {
    redirect(portalPathForRole(user.role));
  }

  const callbackUrl = safeAuthCallbackUrl(params.callbackUrl);
  const googleConfigured = isGoogleAuthConfigured();

  return (
    <PublicPage>
      <div className="mx-auto flex max-w-md flex-col items-center py-8 sm:py-14">
        <Logo variant="lockup" href="/" surface="light" priority className="w-40 sm:w-44" />

        <div className="mt-8 flex w-full flex-col items-center gap-4">
          {params.error === "name" ? (
            <Alert variant="danger" title="Check your name">
              Enter a name between 2 and 80 characters.
            </Alert>
          ) : null}
          {params.error === "email" ? (
            <Alert variant="danger" title="Check your email">
              Enter a valid email address.
            </Alert>
          ) : null}
          {params.error === "password" ? (
            <Alert variant="danger" title="Choose a stronger password">
              Password must be between 8 and 72 characters.
            </Alert>
          ) : null}
          {params.error === "mismatch" ? (
            <Alert variant="danger" title="Passwords do not match">
              Re-enter the same password in both fields.
            </Alert>
          ) : null}
          {params.error === "exists" ? (
            <Alert variant="danger" title="Account already exists">
              An account with this email already has a password.{" "}
              <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="underline">
                Log in
              </Link>{" "}
              instead.
            </Alert>
          ) : null}
          {params.error === "oauth" ? (
            <Alert variant="danger" title="Email already registered">
              This email is already in use. Sign in with Google, or use a
              different email.
            </Alert>
          ) : null}
          {params.error === "database" ? (
            <Alert variant="danger" title="Could not create account">
              The database is not reachable right now. Try again in a moment.
            </Alert>
          ) : null}

          <CitizenRegisterForm
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
