import Image from "next/image";
import { ChoiceTileLink } from "@/components/ui/ChoiceTile";
import type { CivicCategory } from "@/content/civic-categories";
import { PUBLIC_REPORT_HREF } from "@/lib/public-routes";
import { cn } from "@/lib/cn";

type CategoryCardProps = {
  category: CivicCategory;
  className?: string;
};

export function CategoryCard({ category, className }: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <ChoiceTileLink
      href={PUBLIC_REPORT_HREF}
      stacked
      className={cn("ss-category-card", className)}
    >
      <span className="ss-category-card__photo">
        <Image
          src={category.imageSrc}
          alt={category.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="ss-category-card__img"
        />
      </span>
      <span className="ss-category-card__body">
        <span className="ss-choice-tile__icon">
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="ss-choice-tile__title">{category.title}</span>
        <span className="ss-choice-tile__muted">{category.description}</span>
        <span className="ss-choice-tile__cta">Report this issue</span>
      </span>
    </ChoiceTileLink>
  );
}
