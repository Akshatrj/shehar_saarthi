import Image from "next/image";
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from "@/lib/brand";
import { cn } from "@/lib/cn";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  /** Use on dark backgrounds so the logo black matte blends away. */
  blend?: boolean;
  width?: number;
  height?: number;
};

export function BrandLogo({
  className,
  priority = false,
  blend = true,
  width = 320,
  height = 360,
}: BrandLogoProps) {
  return (
    <Image
      src={BRAND_LOGO_SRC}
      alt={BRAND_LOGO_ALT}
      width={width}
      height={height}
      priority={priority}
      className={cn(
        "h-auto w-full select-none",
        blend && "ss-brand-logo-blend",
        className,
      )}
    />
  );
}
