"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { ScrollRevealVariant } from "@/components/motion/ScrollReveal";

type ScrollStaggerProps = {
  children: ReactNode;
  className?: string;
  variant?: ScrollRevealVariant;
  staggerMs?: number;
  threshold?: number;
};

export function ScrollStagger({
  children,
  className,
  variant = "fade-up",
  staggerMs = 90,
  threshold = 0.12,
}: ScrollStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
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
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -6% 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [motionEnabled, threshold]);

  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, index) => {
        if (!isValidElement<{ className?: string; style?: React.CSSProperties }>(
          child,
        )) {
          return child;
        }

        return cloneElement(child, {
          className: cn(
            child.props.className,
            motionEnabled && "ss-reveal",
            motionEnabled && `ss-reveal--${variant}`,
            motionEnabled && visible && "ss-reveal--visible",
          ),
          style: {
            ...child.props.style,
            transitionDelay: `${index * staggerMs}ms`,
          },
        });
      })}
    </div>
  );
}
