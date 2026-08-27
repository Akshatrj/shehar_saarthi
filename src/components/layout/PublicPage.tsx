import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PublicPageProps = {
  children: ReactNode;
  className?: string;
};

export function PublicPage({ children, className }: PublicPageProps) {
  return (
    <div className={cn("ss-container py-5 sm:py-8 lg:py-10", className)}>
      {children}
    </div>
  );
}
