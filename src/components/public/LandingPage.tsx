import { ButtonLink } from "@/components/ui/Button";
import { ChoiceTileStatic } from "@/components/ui/ChoiceTile";
import { PUBLIC_REPORT_HREF } from "@/lib/public-routes";
import { LandingHero } from "@/components/public/LandingHero";
import { CategoryCard } from "@/components/public/CategoryCard";
import { SectionIntro } from "@/components/public/SectionIntro";
import { reportCategories } from "@/content/civic-categories";
import { ReactNode } from "react";

function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 py-10 sm:py-14 lg:py-16 ${className}`}>
      <div className="ss-container">{children}</div>
    </section>
  );
}

export function LandingPage() {
  return (
    <div>
      <LandingHero />

      <Section id="categories">
        <SectionIntro
          eyebrow="What you can report"
          title="Everyday civic problems"
          description="Choose a category to get started. A photo and a location pin are enough for staff to act."
        />
        <div className="ss-landing-stagger mt-8 grid gap-3 overflow-visible py-1 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {reportCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </Section>

      <Section id="transparency" className="bg-brand-50">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
          <SectionIntro
            eyebrow="Open by default"
            title="Track every complaint"
            description="Each report receives a public reference. Follow status from submitted to closed, and confirm the work yourself."
          />
          <ChoiceTileStatic className="ss-category-card p-6">
            <span className="ss-choice-tile__title">What stays private</span>
            <span className="ss-choice-tile__muted">
              Maps and field-facing views show the issue and the location. Your
              name, phone, and email stay with authorised municipal
              administrators. If a fix fails, you can reopen the complaint.
            </span>
          </ChoiceTileStatic>
        </div>
      </Section>

      <Section id="report" className="ss-hero-gradient text-white">
        <div className="text-center">
          <h2 className="text-h1 text-white">See something that needs fixing?</h2>
          <p className="ss-hero-lede mx-auto mt-2 max-w-prose text-body sm:text-lg">
            Take a photo, drop a pin, and give your city a record it can act on.
          </p>
          <div className="mt-6 flex justify-center">
            <ButtonLink href={PUBLIC_REPORT_HREF} size="lg" className="ss-btn-civic w-full sm:w-auto">
              Report an Issue
            </ButtonLink>
          </div>
        </div>
      </Section>
    </div>
  );
}
