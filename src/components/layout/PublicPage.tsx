import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PublicPageProps = {
  children: ReactNode;
  className?: string;
};

export function PublicPage({ children, className }: PublicPageProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 py-8", className)}>
      {children}
    </div>
  );
}
