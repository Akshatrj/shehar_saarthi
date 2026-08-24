import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { GoogleSignInPanel } from "@/components/auth/GoogleSignInButton";
import { Alert } from "@/components/ui/Alert";
import { auth } from "@/lib/auth";
import { isGoogleAuthConfigured } from "@/lib/auth-env";
import { portalPathForRole } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

function resolveCallbackUrl(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/citizen";
  }
  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const session = await auth();

  if (session?.user?.id && session.user.isActive !== false) {
    redirect(portalPathForRole(session.user.role));
  }

  const callbackUrl = resolveCallbackUrl(params.callbackUrl);
  const googleConfigured = isGoogleAuthConfigured();

  return (
    <AuthScreen
      title="Sign in to Shehar Saarthi"
      description="Use your Google account. No passwords are stored on this platform."
      footer={
        <p className="text-small text-muted">
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
      }
    >
      <div className="flex flex-col gap-4">
        {params.error === "inactive" ? (
          <Alert variant="danger" title="Account inactive">
            Your account has been deactivated. Contact your municipality
            administrator.
          </Alert>
        ) : null}
        {params.error === "OAuthAccountNotLinked" ? (
          <Alert variant="danger" title="Sign-in failed">
            This Google account could not be linked. Try again or use another
            account.
          </Alert>
        ) : null}
        {params.error === "Configuration" ? (
          <Alert variant="danger" title="Google sign-in is not configured">
            Add <code className="text-small">AUTH_GOOGLE_ID</code> and{" "}
            <code className="text-small">AUTH_GOOGLE_SECRET</code> to{" "}
            <code className="text-small">.env.local</code>, then restart{" "}
            <code className="text-small">npm run dev</code>. Use the redirect URI{" "}
            <code className="text-small">/api/auth/callback/google</code> in Google
            Cloud Console.
          </Alert>
        ) : null}
        {!googleConfigured ? (
          <Alert variant="danger" title="Google sign-in is not configured">
            Add <code className="text-small">AUTH_GOOGLE_ID</code> and{" "}
            <code className="text-small">AUTH_GOOGLE_SECRET</code> to{" "}
            <code className="text-small">.env.local</code>, then restart{" "}
            <code className="text-small">npm run dev</code>.
          </Alert>
        ) : null}
        <GoogleSignInPanel callbackUrl={callbackUrl} disabled={!googleConfigured} />
      </div>
    </AuthScreen>
  );
}
