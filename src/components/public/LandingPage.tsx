import { ReactNode } from "react";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { civicCategories } from "@/content/landing";

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
      <section className="ss-hero-gradient border-b border-navy-light text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20 lg:py-24">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-small font-semibold uppercase tracking-[0.16em] text-brand-light">
                Civic Issue Portal
              </p>
              <h1 className="mt-3 text-[2.125rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-display">
                Your City. Your Voice. Your Change.
              </h1>
              <p className="mt-4 max-w-xl text-body text-navy-muted sm:text-lg sm:leading-7">
                Photograph a civic problem, pin the place, and follow the work until
                it is done. Field teams see the issue — not your name.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/report" size="lg">
                  Report an issue
                </ButtonLink>
                <ButtonLink
                  href="/complaints"
                  variant="secondary"
                  size="lg"
                  className="border-white/20 bg-white/10 text-white ring-white/25 hover:bg-white/15"
                >
                  Track a complaint
                </ButtonLink>
              </div>
            </div>
            <div className="flex shrink-0 justify-center lg:justify-end">
              <Image
                src="/brand/shehar-saarthi-logo.png"
                alt="Shehar Saarthi logo"
                width={320}
                height={360}
                className="h-auto w-56 drop-shadow-2xl sm:w-64"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <Section id="categories">
        <p className="text-small font-semibold uppercase tracking-wider text-brand">
          What you can report
        </p>
        <h2 className="mt-2 max-w-xl text-h1 text-navy">
          Everyday civic problems
        </h2>
        <p className="mt-2 max-w-prose text-body text-muted">
          A photo and a pin are enough. The right department sees the work.
        </p>
        <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {civicCategories.map((category) => (
            <li key={category.title}>
              <Image
                src={category.image}
                alt={category.imageAlt}
                width={640}
                height={480}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                className="aspect-[4/3] w-full rounded-lg object-cover shadow-sm ring-1 ring-line"
              />
              <h3 className="mt-3 text-body font-semibold text-navy">
                {category.title}
              </h3>
              <p className="mt-1 text-small text-muted">{category.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="transparency" className="bg-brand-50">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-small font-semibold uppercase tracking-wider text-brand">
              Open by default
            </p>
            <h2 className="mt-2 text-h1 text-navy">Track every complaint</h2>
            <p className="mt-2 max-w-prose text-body text-muted">
              Each report receives a public reference. Follow status from
              submitted to closed, and confirm the work yourself.
            </p>
          </div>
          <div className="rounded-lg border border-brand-200 bg-paper-raised p-6 shadow-sm">
            <h3 className="text-body font-semibold text-navy">
              What stays private
            </h3>
            <p className="mt-2 max-w-prose text-body text-muted">
              Maps and field-facing views show the issue and the location. Your
              name, phone, and email stay with authorised municipal
              administrators. If a fix fails, you can reopen the complaint.
            </p>
          </div>
        </div>
      </Section>

      <Section id="report" className="ss-hero-gradient text-white">
        <div className="text-center">
          <h2 className="text-h1 text-white">
            See something that needs fixing?
          </h2>
          <p className="mx-auto mt-2 max-w-prose text-body text-navy-muted">
            Take a photo, drop a pin, and give your city a record it can act on.
          </p>
          <div className="mt-6 flex justify-center">
            <ButtonLink href="/report" size="lg">
              Report an issue
            </ButtonLink>
          </div>
        </div>
      </Section>
    </div>
  );
}
