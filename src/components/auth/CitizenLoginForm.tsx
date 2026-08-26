import Link from "next/link";
import { signInWithCredentials } from "@/app/(public)/login/actions";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { LoginSubmitButton } from "@/components/auth/LoginSubmitButton";
import { authPillInputClassName } from "@/components/auth/auth-styles";

type CitizenLoginFormProps = {
  callbackUrl: string;
  googleConfigured: boolean;
  deskHint?: string | null;
};

export function CitizenLoginForm({
  callbackUrl,
  googleConfigured,
  deskHint,
}: CitizenLoginFormProps) {
  return (
    <div className="w-full max-w-[min(100%,22.5rem)] rounded-[10px] bg-paper-raised p-5 shadow-md sm:p-8">
      <h1 className="text-center text-h2 font-bold text-navy">Welcome back</h1>
      {deskHint ? (
        <p className="mt-1 text-center text-small text-muted">
          Sign in to the {deskHint}.
        </p>
      ) : null}

      <form
        action={signInWithCredentials.bind(null, callbackUrl)}
        className="mt-6 flex flex-col gap-3"
      >
        <div>
          <label htmlFor="login-email" className="sr-only">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email"
            className={authPillInputClassName}
          />
        </div>

        <div>
          <label htmlFor="login-password" className="sr-only">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Password"
            className={authPillInputClassName}
          />
        </div>

        <Link
          href="/contact"
          className="self-end text-small text-muted underline underline-offset-2 hover:text-navy"
          aria-label="Forgot password? Password reset is not available yet. Contact support."
        >
          Forgot Password?
        </Link>

        <LoginSubmitButton />
      </form>

      <p className="mt-4 text-center text-small text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
        >
          Sign up
        </Link>
      </p>

      <div className="my-5 flex items-center gap-3" role="separator">
        <span className="h-px flex-1 bg-line" />
        <span className="text-small text-muted">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      {googleConfigured ? (
        <GoogleSignInButton
          callbackUrl={callbackUrl}
          label="Log in with Google"
          className="rounded-[20px]"
        />
      ) : (
        <div className="flex flex-col gap-2">
          <GoogleSignInButton
            callbackUrl={callbackUrl}
            label="Log in with Google"
            disabled
            className="rounded-[20px]"
          />
          <p className="text-center text-small text-muted" role="status">
            Google sign-in is not configured on this server.
          </p>
        </div>
      )}
    </div>
  );
}
