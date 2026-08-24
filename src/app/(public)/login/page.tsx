import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Alert } from "@/components/ui/Alert";
import { auth } from "@/lib/auth";
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
        <GoogleSignInButton callbackUrl={callbackUrl} />
      </div>
    </AuthScreen>
  );
}
