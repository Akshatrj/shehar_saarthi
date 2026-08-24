"use client";

import {
  type ElementType,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export type ScrollRevealVariant =
  | "fade-up"
  | "fade-down"
  | "fade-in"
  | "fade-left"
  | "fade-right"
  | "scale-up"
  | "blur-in";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  variant?: ScrollRevealVariant;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  as?: ElementType;
};

export function ScrollReveal({
  children,
  className,
  variant = "fade-up",
  delay = 0,
  duration = 700,
  threshold = 0.15,
  once = true,
  as: Component = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setMotionEnabled(!prefersReducedMotion);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!motionEnabled) {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [motionEnabled, once, threshold]);

  const motionClass = motionEnabled ? "ss-reveal" : "";

  return (
    <Component
      ref={ref}
      className={cn(
        motionClass,
        motionEnabled && `ss-reveal--${variant}`,
        motionEnabled && visible && "ss-reveal--visible",
        className,
      )}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </Component>
  );
}
