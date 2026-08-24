import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { PUBLIC_REPORT_HREF } from "@/lib/public-routes";
import { LandingHero } from "@/components/public/LandingHero";
import { SectionIntro } from "@/components/public/SectionIntro";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { ScrollStagger } from "@/components/motion/ScrollStagger";
import { civicCategories } from "@/content/landing";
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
    <section id={id} className={`scroll-mt-24 px-4 py-12 sm:py-16 ${className}`}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

export function LandingPage() {
  return (
    <div>
      <LandingHero />

      <Section id="categories">
        <ScrollReveal className="w-full">
          <SectionIntro
            eyebrow="What you can report"
            title="Everyday civic problems"
            description="A photo and a pin are enough. The right department sees the work."
          />
        </ScrollReveal>        <ScrollStagger
          className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
          staggerMs={100}
        >
          {civicCategories.map((category) => (
            <article
              key={category.title}
              className="group"
            >
              <div className="overflow-hidden rounded-lg ring-1 ring-line transition-[box-shadow,transform] duration-500 group-hover:-translate-y-1 group-hover:shadow-md">
                <Image
                  src={category.image}
                  alt={category.imageAlt}
                  width={640}
                  height={480}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <h3 className="mt-3 text-body font-semibold text-navy">
                {category.title}
              </h3>
              <p className="mt-1 text-small text-muted">{category.description}</p>
            </article>
          ))}
        </ScrollStagger>
      </Section>

      <Section id="transparency" className="bg-brand-50">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <ScrollReveal className="w-full">
            <SectionIntro
              eyebrow="Open by default"
              title="Track every complaint"
              description="Each report receives a public reference. Follow status from submitted to closed, and confirm the work yourself."
            />
          </ScrollReveal>
          <ScrollReveal className="w-full" delay={120}>            <div className="rounded-lg border border-brand-200 bg-paper-raised p-6 shadow-sm transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-md">
              <h3 className="text-body font-semibold text-navy">
                What stays private
              </h3>
              <p className="mt-2 max-w-prose text-body text-muted">
                Maps and field-facing views show the issue and the location. Your
                name, phone, and email stay with authorised municipal
                administrators. If a fix fails, you can reopen the complaint.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </Section>

      <Section id="report" className="ss-hero-gradient text-white">
        <ScrollReveal variant="scale-up">
          <div className="text-center">
            <h2 className="text-h1 text-white">
              See something that needs fixing?
            </h2>
            <p className="mx-auto mt-2 max-w-prose text-body text-navy-muted">
              Take a photo, drop a pin, and give your city a record it can act on.
            </p>
            <div className="mt-6 flex justify-center">
              <ButtonLink href={PUBLIC_REPORT_HREF} size="lg">
                Report an issue
              </ButtonLink>
            </div>
          </div>
        </ScrollReveal>
      </Section>
    </div>
  );
}
