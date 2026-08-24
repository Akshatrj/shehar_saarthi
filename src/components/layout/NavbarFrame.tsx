"use client";

import { type ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type NavbarFrameProps = {
  children: ReactNode;
  className?: string;
};

export function NavbarFrame({ children, className }: NavbarFrameProps) {
  const [scrolled, setScrolled] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-line/80 bg-paper-raised/90 shadow-sm backdrop-blur-md transition-[background-color,box-shadow,border-color,transform] duration-500",
        !prefersReducedMotion && scrolled && "ss-navbar-scrolled",
        className,
      )}
    >
      {children}
    </header>
  );
}
