import { ReactNode } from "react";
import { PublicPage } from "@/components/layout/PublicPage";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  AlertTriangle,
  Camera,
  Clock,
  Cookie,
  CreditCard,
  EyeOff,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";

function PrivacyHighlight({
  icon: Icon,
  children,
  variant = "brand",
}: {
  icon: LucideIcon;
  children: ReactNode;
  variant?: "brand" | "orange";
}) {
  return (
    <div
      className={cn(
        "ss-privacy-highlight flex gap-3 rounded-xl border px-4 py-3.5 sm:gap-3.5 sm:px-5 sm:py-4",
        variant === "orange"
          ? "ss-privacy-highlight--orange border-orange/25 bg-orange-50/70"
          : "border-brand/15 bg-brand-50/50",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          variant === "orange"
            ? "bg-orange/10 text-orange"
            : "bg-brand/10 text-brand",
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <p className="min-w-0 text-body leading-relaxed text-navy">{children}</p>
    </div>
  );
}

function PrivacySection({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="scroll-mt-8">
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paper-raised text-brand shadow-sm ring-1 ring-line/60"
          aria-hidden="true"
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={id} className="text-h3 text-navy">
            {title}
          </h2>
          <div className="mt-3 flex flex-col gap-3 text-body leading-relaxed text-muted">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export function PrivacyContent() {
  return (
    <PublicPage>
      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-brand-50/80 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-12 top-32 h-40 w-40 rounded-full bg-orange-50/60 blur-3xl"
        />

        <header className="relative max-w-prose">
          <p className="text-small font-semibold uppercase tracking-[0.18em] text-brand">
            Your data
          </p>
          <h1 className="mt-2 text-h1 text-navy">Privacy</h1>
          <p className="mt-4 text-body leading-relaxed text-muted sm:text-[1.0625rem] sm:leading-7">
            Your privacy matters to us. This page explains what information
            SheharSaarthi collects, why we need it, and who can see it.
          </p>
          <p className="mt-3 text-small text-muted">
            Last updated: 18 August 2026
          </p>
        </header>

        <article className="relative mt-10 max-w-prose space-y-10 sm:mt-12 sm:space-y-12">
          <PrivacySection
            id="privacy-collect"
            title="What information do we collect?"
            icon={Shield}
          >
            <p>When you use SheharSaarthi, we may collect:</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-brand">
              <li>
                Your account details — such as your name, email, phone number,
                and password.
              </li>
              <li>
                Complaint details — such as the type of issue, description, and
                location.
              </li>
              <li>
                Photos — images you upload to show the problem or provide an
                update.
              </li>
              <li>
                Complaint activity — such as status changes, assignments, and
                notifications.
              </li>
              <li>
                Sign-in information — a small cookie that keeps you signed in.
              </li>
            </ul>
            <PrivacyHighlight icon={CreditCard}>
              We do not collect payment information.
            </PrivacyHighlight>
          </PrivacySection>

          <PrivacySection
            id="privacy-visibility"
            title="Who can see your information?"
            icon={EyeOff}
          >
            <PrivacyHighlight icon={Shield}>
              Your personal details are kept private.
            </PrivacyHighlight>
            <p>
              Municipal administrators may see your name, phone number, and
              email when they need them to manage your complaint.
            </p>
            <PrivacyHighlight icon={EyeOff}>
              Field workers only see the information they need to fix the issue
              — such as the problem, photo, and location. They do not see who
              reported it.
            </PrivacyHighlight>
            <p>
              Public maps and issue areas do not show your name, phone number,
              or email.
            </p>
          </PrivacySection>

          <PrivacySection
            id="privacy-photos"
            title="What happens to your photos?"
            icon={Camera}
          >
            <PrivacyHighlight icon={Camera}>
              Photos you upload are kept private. They are only shown to people
              who are signed in and have permission to view that complaint.
            </PrivacyHighlight>
          </PrivacySection>

          <PrivacySection
            id="privacy-cookies"
            title="What about cookies?"
            icon={Cookie}
          >
            <p>We use a small cookie that keeps you signed in.</p>
            <p>
              SheharSaarthi does not use advertising trackers or advertising
              pixels.
            </p>
          </PrivacySection>

          <PrivacySection
            id="privacy-retention"
            title="How long do we keep your complaints?"
            icon={Clock}
          >
            <p>
              Your complaints are kept so the city can track, manage, and
              resolve civic issues.
            </p>
            <p>
              The exact retention and deletion rules may depend on the
              municipality using SheharSaarthi.
            </p>
            <p>You can sign in at any time to view your own complaints.</p>
          </PrivacySection>

          <PrivacySection
            id="privacy-duplicates"
            title="What if someone reports the same problem?"
            icon={Users}
          >
            <p>
              If multiple people report the same issue, the reports may be
              connected so the municipality can understand that several people
              are experiencing the same problem.
            </p>
            <p>
              Your report is not simply deleted because it looks similar to
              another report.
            </p>
          </PrivacySection>

          <PrivacySection
            id="privacy-emergency"
            title="Important: SheharSaarthi is not an emergency service"
            icon={AlertTriangle}
          >
            <PrivacyHighlight icon={AlertTriangle} variant="orange">
              For emergencies such as fire, crime, or medical emergencies,
              please contact the emergency services provided by your local
              authorities.
            </PrivacyHighlight>
            <p>
              SheharSaarthi is designed for everyday civic issues — helping
              your city notice them, manage them, and get them resolved.
            </p>
          </PrivacySection>
        </article>

        <div className="relative mt-10 sm:mt-12">
          <ButtonLink href="/" variant="secondary">
            Back to home
          </ButtonLink>
        </div>
      </div>
    </PublicPage>
  );
}
