import Link from "next/link";
import { registerWithCredentials } from "@/app/(public)/register/actions";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { LoginSubmitButton } from "@/components/auth/LoginSubmitButton";
import { authPillInputClassName } from "@/components/auth/auth-styles";

type CitizenRegisterFormProps = {
  callbackUrl: string;
  googleConfigured: boolean;
};

export function CitizenRegisterForm({
  callbackUrl,
  googleConfigured,
}: CitizenRegisterFormProps) {
  const loginHref = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <div className="w-full max-w-[min(100%,22.5rem)] rounded-[10px] bg-paper-raised p-5 shadow-md sm:p-8">
      <h1 className="text-center text-h2 font-bold text-navy">Create account</h1>
      <p className="mt-1 text-center text-small text-muted">
        Sign up with email and password to report civic issues.
      </p>

      <form
        action={registerWithCredentials.bind(null, callbackUrl)}
        className="mt-6 flex flex-col gap-3"
      >
        <div>
          <label htmlFor="register-name" className="sr-only">
            Full name
          </label>
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            placeholder="Full name"
            className={authPillInputClassName}
          />
        </div>

        <div>
          <label htmlFor="register-email" className="sr-only">
            Email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email"
            className={authPillInputClassName}
          />
        </div>

        <div>
          <label htmlFor="register-password" className="sr-only">
            Password
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            placeholder="Password"
            className={authPillInputClassName}
          />
        </div>

        <div>
          <label htmlFor="register-confirm" className="sr-only">
            Confirm password
          </label>
          <input
            id="register-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            placeholder="Confirm password"
            className={authPillInputClassName}
          />
        </div>

        <LoginSubmitButton label="Sign up" pendingLabel="Creating account…" />
      </form>

      <p className="mt-4 text-center text-small text-muted">
        Already have an account?{" "}
        <Link
          href={loginHref}
          className="font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
        >
          Log in
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
          label="Sign up with Google"
          className="rounded-[20px]"
        />
      ) : (
        <div className="flex flex-col gap-2">
          <GoogleSignInButton
            callbackUrl={callbackUrl}
            label="Sign up with Google"
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
