import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Table({
  className,
  caption,
  children,
  embedded = false,
  ...props
}: HTMLAttributes<HTMLTableElement> & {
  caption?: string;
  embedded?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto",
        !embedded && "rounded-md border border-line bg-paper-raised",
      )}
    >
      <table className={cn("w-full min-w-[40rem] text-left text-small", className)} {...props}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("sticky top-0 bg-brand-50 text-navy", className)}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-line", className)} {...props} />;
}

export function TableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("hover:bg-brand-50/60", className)} {...props} />
  );
}

export function TableHead({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-line px-4 py-3 font-semibold",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 text-ink", className)} {...props} />;
}
