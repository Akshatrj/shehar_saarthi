import Image from "next/image";
import { cn } from "@/lib/cn";

type HeroLogoShowcaseProps = {
  className?: string;
};

export function HeroLogoShowcase({ className }: HeroLogoShowcaseProps) {
  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-[18rem] items-center justify-center sm:max-w-[20rem]",
        className,
      )}
      aria-hidden="true"
    >
      <div className="ss-hero-logo-ambient absolute inset-0 scale-110 rounded-full blur-2xl" />

      <div className="ss-hero-logo-ring absolute inset-[-12%] rounded-full border border-brand-light/20" />
      <div className="ss-hero-logo-ring ss-hero-logo-ring--delay absolute inset-[-20%] rounded-full border border-orange/15" />

      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.08] via-brand/10 to-orange/10 p-3 shadow-[0_24px_60px_rgb(10_25_47_/_0.45)] backdrop-blur-md sm:p-4">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-light/20 via-transparent to-orange/10" />
        <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-brand-light/25 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-orange/20 blur-2xl" />
        <div className="pointer-events-none absolute bottom-4 left-4 h-10 w-10 rounded-full bg-accent/20 blur-xl" />

        <Image
          src="/brand/shehar-saarthi-logo.png"
          alt=""
          width={320}
          height={360}
          className="relative z-10 h-auto w-full drop-shadow-[0_12px_32px_rgb(0_0_0_/_0.35)]"
          priority
        />
      </div>
    </div>
  );
}
