import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { LogoMark } from "@/components/layout/LogoMark";
import { cn } from "@/lib/cn";

type LogoProps = {
  href?: string;
  compact?: boolean;
  variant?: "inline" | "lockup";
  /** Lockup on light pages uses a dark chip so the logo blends cleanly. */
  surface?: "dark" | "light";
  priority?: boolean;
  className?: string;
};

export function Logo({
  href = "/",
  compact = false,
  variant = "inline",
  surface = "dark",
  priority = false,
  className,
}: LogoProps) {
  const lockup = (
    <BrandLogo
      priority={priority}
      className={cn("w-44 sm:w-52", variant === "lockup" ? className : undefined)}
      width={280}
      height={320}
    />
  );

  const content =
    variant === "lockup" ? (
      surface === "light" ? (
        <div className="rounded-xl bg-navy px-3 py-2 shadow-sm ring-1 ring-navy-light/40">
          {lockup}
        </div>
      ) : (
        lockup
      )
    ) : (
      <>
        <LogoMark className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
        <span className="min-w-0 leading-none">
          <span className="ss-brand-text block text-[0.95rem] font-bold uppercase tracking-wide text-navy sm:text-body">
            Shehar{" "}
            <span className="text-brand">
              Saarthi
              <span className="text-orange">.</span>
            </span>
          </span>
          {compact ? null : (
            <span className="mt-0.5 hidden text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted sm:block">
              Civic Issue Portal
            </span>
          )}
        </span>
      </>
    );

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-w-0 items-center gap-2.5 rounded-sm",
        variant === "lockup" ? "flex-col items-start" : "",
        variant !== "lockup" ? className : undefined,
      )}
      aria-label="Shehar Saarthi home"
    >
      {content}
    </Link>
  );
}
