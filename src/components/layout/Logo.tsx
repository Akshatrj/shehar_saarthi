import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/layout/LogoMark";

type LogoProps = {
  href?: string;
  compact?: boolean;
  variant?: "inline" | "lockup";
  className?: string;
};

export function Logo({
  href = "/",
  compact = false,
  variant = "inline",
  className,
}: LogoProps) {
  const content =
    variant === "lockup" ? (
      <Image
        src="/brand/shehar-saarthi-logo.png"
        alt="Shehar Saarthi — Civic Issue Portal"
        width={280}
        height={320}
        className={cn("h-auto w-44 sm:w-52", className)}
        priority
      />
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
        className,
      )}
      aria-label="Shehar Saarthi home"
    >
      {content}
    </Link>
  );
}
