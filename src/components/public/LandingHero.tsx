"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { PUBLIC_REPORT_HREF, PUBLIC_TRACK_HREF } from "@/lib/public-routes";
import { HeroLogoShowcase } from "@/components/public/HeroLogoShowcase";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function LandingHero() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [parallax, setParallax] = useState(0);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const reduced = prefersReducedMotion;
    setMotionEnabled(!reduced);
    if (reduced) {
      setEntered(true);
      return;
    }

    const frame = window.requestAnimationFrame(() => setEntered(true));

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setParallax(Math.min(window.scrollY * 0.18, 96));
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [prefersReducedMotion]);

  return (
    <section className="ss-hero-gradient relative overflow-hidden border-b border-navy-light text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
      >
        <div className="absolute -left-24 top-10 h-56 w-56 rounded-full bg-brand-light/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-orange/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20 lg:py-24">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p
              className={cn(
                "text-small font-semibold uppercase tracking-[0.18em] text-brand-light",
                motionEnabled && "ss-hero-enter ss-hero-enter--1",
                motionEnabled && entered && "ss-hero-enter--visible",
              )}
            >
              Civic Issue Portal
            </p>
            <h1
              className={cn(
                "mt-3 text-[2.125rem] font-semibold leading-[1.12] tracking-tight text-white drop-shadow-[0_2px_18px_rgb(10_25_47_/_0.45)] sm:text-display",
                motionEnabled && "ss-hero-enter ss-hero-enter--2",
                motionEnabled && entered && "ss-hero-enter--visible",
              )}
            >
              Your City. Your Voice. Your Saarthi.
            </h1>
            <p
              className={cn(
                "ss-hero-lede mt-4 max-w-xl text-body sm:text-lg sm:leading-7",
                motionEnabled && "ss-hero-enter ss-hero-enter--3",
                motionEnabled && entered && "ss-hero-enter--visible",
              )}
            >
              Report civic issues, track their progress, and help make your city
              better.
            </p>
            <div
              className={cn(
                "mt-8 flex flex-wrap gap-3",
                motionEnabled && "ss-hero-enter ss-hero-enter--4",
                motionEnabled && entered && "ss-hero-enter--visible",
              )}
            >
              <ButtonLink href={PUBLIC_REPORT_HREF} size="lg" className="ss-btn-civic">
                Report an Issue
              </ButtonLink>
              <ButtonLink
                href={PUBLIC_TRACK_HREF}
                variant="secondary"
                size="lg"
                className="border-white/20 bg-white/10 text-white ring-white/25 hover:bg-white/15"
              >
                Track Complaint
              </ButtonLink>
            </div>
          </div>

          <div
            className={cn(
              "flex shrink-0 justify-center lg:justify-end",
              motionEnabled && "ss-hero-enter ss-hero-enter--5",
              motionEnabled && entered && "ss-hero-enter--visible",
            )}
            style={{
              transform: prefersReducedMotion ? undefined : `translateY(${parallax}px)`,
            }}
          >
            <HeroLogoShowcase />
          </div>
        </div>
      </div>
    </section>
  );
}
