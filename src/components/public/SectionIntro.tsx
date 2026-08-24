import { cn } from "@/lib/cn";

type SectionIntroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  titleClassName?: string;
};

export function SectionIntro({
  eyebrow,
  title,
  description,
  className,
  titleClassName,
}: SectionIntroProps) {
  return (
    <div className={cn("flex w-full flex-col items-start text-left", className)}>
      <p className="m-0 text-small font-semibold uppercase tracking-wider text-brand">
        {eyebrow}
      </p>
      <h2 className={cn("m-0 mt-2 text-h1 text-navy", titleClassName)}>{title}</h2>
      {description ? (
        <p className="m-0 mt-2 max-w-prose text-body text-muted">{description}</p>
      ) : null}
    </div>
  );
}
