import { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function choiceTileClassName(
  options: {
    selected?: boolean;
    stacked?: boolean;
    staticTile?: boolean;
    className?: string;
  } = {},
) {
  return cn(
    "ss-choice-tile",
    options.selected && "ss-choice-tile--selected",
    options.stacked && "ss-choice-tile--stack",
    options.staticTile && "ss-choice-tile--static",
    options.className,
  );
}

type ChoiceTileProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  stacked?: boolean;
  children: ReactNode;
};

export function ChoiceTile({
  selected = false,
  stacked = false,
  className,
  children,
  type = "button",
  ...props
}: ChoiceTileProps) {
  return (
    <button
      type={type}
      className={choiceTileClassName({ selected, stacked, className })}
      {...props}
    >
      {children}
    </button>
  );
}

type ChoiceTileLinkProps = {
  href: string;
  selected?: boolean;
  stacked?: boolean;
  className?: string;
  children: ReactNode;
};

export function ChoiceTileLink({
  href,
  selected = false,
  stacked = false,
  className,
  children,
}: ChoiceTileLinkProps) {
  return (
    <Link
      href={href}
      className={choiceTileClassName({ selected, stacked, className })}
    >
      {children}
    </Link>
  );
}

export function ChoiceTileStatic({
  stacked = false,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { stacked?: boolean }) {
  return (
    <div
      className={choiceTileClassName({ stacked, staticTile: true, className })}
      {...props}
    >
      {children}
    </div>
  );
}
