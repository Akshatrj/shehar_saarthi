import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

const variants = {
  primary:
    "ss-btn-civic bg-orange text-white shadow-brand hover:bg-orange-dark focus-visible:outline-orange",
  secondary:
    "bg-paper-raised text-brand-dark ring-1 ring-inset ring-line hover:bg-brand-50 focus-visible:outline-brand",
  ghost:
    "bg-transparent text-brand-dark hover:bg-brand-50 focus-visible:outline-brand",
  danger:
    "bg-danger text-white hover:bg-danger/90 focus-visible:outline-danger",
  dangerSoft:
    "ss-soft-danger !shadow-none ring-0 focus-visible:outline-danger",
} as const;

const sizes = {
  sm: "min-h-11 px-3 text-small",
  md: "min-h-11 px-4 text-small",
  lg: "min-h-12 px-5 text-body",
} as const;

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function buttonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonClassName(variant, size, className)}
        {...props}
      />
    );
  },
);

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClassName(variant, size, className)}>
      {children}
    </Link>
  );
}
