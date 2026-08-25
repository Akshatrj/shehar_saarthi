import { BrandLogo } from "@/components/layout/BrandLogo";
import { signInWithGoogle } from "@/app/(public)/login/actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type GoogleSignInButtonProps = {
  callbackUrl?: string;
  pickAccount?: boolean;
  label?: string;
  disabled?: boolean;
  className?: string;
};

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function GoogleSignInButton({
  callbackUrl = "/citizen",
  pickAccount = false,
  label = "Continue with Google",
  disabled = false,
  className,
}: GoogleSignInButtonProps) {
  return (
    <form action={signInWithGoogle.bind(null, callbackUrl, pickAccount)}>
      <Button
        type="submit"
        size="lg"
        disabled={disabled}
        className={cn(
          "h-12 w-full rounded-full border border-[#dadce0] bg-white px-5 text-[0.95rem] font-medium text-[#3c4043] shadow-none hover:bg-[#f8f9fa]",
          className,
        )}
      >
        <GoogleMark />
        {label}
      </Button>
    </form>
  );
}

type GoogleSignInPanelProps = {
  callbackUrl?: string;
  disabled?: boolean;
};

export function GoogleSignInPanel({
  callbackUrl = "/citizen",
  disabled = false,
}: GoogleSignInPanelProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-sm">
      <div className="border-b border-line bg-brand-50/70 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-navy p-1.5 shadow-sm ring-1 ring-line">
            <BrandLogo
              width={56}
              height={56}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="text-body font-semibold text-navy">Shehar Saarthi</p>
            <p className="mt-0.5 text-small text-muted">
              Sign in once with Google. You will not need a separate password.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        <GoogleSignInButton callbackUrl={callbackUrl} disabled={disabled} />
        <p className="text-center text-small leading-relaxed text-muted">
          Google may ask you to allow email and basic profile access the first
          time. After that, sign-in is usually one click.
        </p>
        <form action={signInWithGoogle.bind(null, callbackUrl, true)}>
          <button
            type="submit"
            disabled={disabled}
            className="mx-auto block text-small font-medium text-brand underline-offset-2 hover:underline disabled:opacity-50"
          >
            Use a different Google account
          </button>
        </form>
      </div>
    </div>
  );
}
