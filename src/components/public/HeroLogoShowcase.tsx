"use client";

import { PointerEvent, useRef } from "react";
import { LivingBrandMark } from "@/components/public/LivingBrandMark";
import { cn } from "@/lib/cn";

type HeroLogoShowcaseProps = {
  className?: string;
};

export function HeroLogoShowcase({ className }: HeroLogoShowcaseProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    stage.style.setProperty("--ss-tilt-x", `${(y * -14).toFixed(2)}deg`);
    stage.style.setProperty("--ss-tilt-y", `${(x * 16).toFixed(2)}deg`);
  };

  const onPointerLeave = () => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty("--ss-tilt-x", "0deg");
    stage.style.setProperty("--ss-tilt-y", "0deg");
  };

  return (
    <div
      ref={stageRef}
      className={cn(
        "ss-living-stage relative mx-auto flex w-full max-w-[16rem] flex-col items-center sm:max-w-[19rem] lg:max-w-[22rem]",
        className,
      )}
      aria-hidden="true"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="ss-hero-logo-ambient absolute inset-x-4 top-6 h-48 rounded-full blur-3xl" />
      <div className="ss-living-card relative w-full">
        <LivingBrandMark className="relative z-10 h-auto w-full drop-shadow-[0_18px_36px_rgb(10_25_47_/_0.45)]" />
        <p className="ss-living-wordmark relative z-10 mt-1 text-center text-[1.65rem] font-bold uppercase leading-none tracking-[0.04em] sm:text-[1.9rem]">
          Shehar <span>Saarthi</span>
          <span className="text-orange">.</span>
        </p>
        <p className="ss-living-tagline relative z-10 mt-3 flex items-center justify-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/90">
          <span className="ss-living-rule h-px w-10" />
          Civic Issue Portal
          <span className="ss-living-rule h-px w-10" />
        </p>
      </div>
    </div>
  );
}
