"use client";

import { ScrollReveal } from "@/components/motion/ScrollReveal";

function BrandEquation() {
  return (
    <div className="ss-about-brand">
      <div
        className="ss-about-brand-equation"
        role="group"
        aria-label="Shehar plus Saarthi"
      >
        <div className="ss-about-brand-box ss-about-brand-box--city">
          <span className="ss-about-brand-label text-brand">SHEHAR</span>
          <span className="ss-about-brand-word">City</span>
        </div>
        <span className="ss-about-brand-plus text-orange" aria-hidden="true">
          +
        </span>
        <div className="ss-about-brand-box ss-about-brand-box--companion">
          <span className="ss-about-brand-label text-orange">SAARTHI</span>
          <span className="ss-about-brand-word">Companion</span>
        </div>
      </div>
    </div>
  );
}

export function AboutEditorial() {
  return (
    <section
      aria-labelledby="about-heading"
      className="ss-about-editorial relative overflow-hidden border-b border-line"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-8 h-48 w-48 rounded-full bg-brand-50/80 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-56 w-56 rounded-full bg-orange-50/70 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-brand-100/40 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line to-transparent" />
      </div>

      <div className="ss-container relative py-8 sm:py-12 lg:py-14">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 xl:gap-16">
          <div className="flex max-w-xl flex-col">
            <ScrollReveal variant="fade-up" delay={0}>
              <p className="text-small font-semibold uppercase tracking-[0.2em] text-brand">
                ABOUT
              </p>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={80}>
              <h1
                id="about-heading"
                className="ss-display mt-3 font-semibold text-navy"
              >
                A better city starts with being heard.
              </h1>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={140}>
              <p className="mt-4 text-body leading-relaxed text-muted sm:mt-5 sm:text-[1.0625rem] sm:leading-7">
                Shehar means city. Saarthi means companion. SheharSaarthi is
                built to bring the people who live in a city closer to the people
                who take care of it.
              </p>
            </ScrollReveal>
          </div>

          <div className="flex max-w-lg flex-col gap-6 lg:max-w-none lg:pt-1">
            <ScrollReveal variant="fade-up" delay={120}>
              <BrandEquation />
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={180}>
              <p className="text-body font-medium text-navy">
                Together, a companion for your city.
              </p>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={220}>
              <div className="ss-about-report group relative overflow-hidden rounded-xl border border-line/70 bg-gradient-to-br from-paper-raised via-paper-raised to-brand-50/50 px-5 py-5 shadow-sm sm:px-6 sm:py-6">
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand via-brand to-orange"
                />
                <p className="text-small text-muted">
                  See something that needs fixing?
                </p>
                <p className="ss-about-report-line mt-2 text-[1.35rem] font-semibold leading-snug tracking-tight text-navy sm:text-[1.5rem]">
                  <span className="ss-about-report-word">Report it.</span>{" "}
                  <span className="ss-about-report-word text-brand">Pin it.</span>{" "}
                  <span className="ss-about-report-word text-orange">
                    Track it.
                  </span>
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={280}>
              <p className="text-body leading-relaxed text-muted">
                Your complaint gets a record. The right people can act on it. And
                you can follow what happens next.
              </p>
            </ScrollReveal>
          </div>
        </div>

        <ScrollReveal variant="fade-up" delay={320} className="mt-10 lg:mt-12">
          <div className="max-w-3xl border-t border-line/70 pt-8 sm:pt-10">
            <p className="text-[1.25rem] font-semibold leading-snug text-navy sm:text-[1.5rem] sm:leading-tight">
              You notice. We connect. The city responds.
            </p>
            <p className="mt-3 text-small text-muted">
              SheharSaarthi — your companion in making the city better.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
