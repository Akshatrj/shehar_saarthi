import { PublicPage } from "@/components/layout/PublicPage";
import { ButtonLink } from "@/components/ui/Button";
import { ChoiceTileStatic } from "@/components/ui/ChoiceTile";
import { PUBLIC_REPORT_HREF } from "@/lib/public-routes";
import { workflowSteps } from "@/content/landing";
import type { Metadata } from "next";
import {
  BadgeCheck,
  Camera,
  Route,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How SheharSaarthi takes a civic report from photo to citizen-verified resolution.",
};

const STEP_ICONS: LucideIcon[] = [Camera, ShieldCheck, Route, Wrench, BadgeCheck];

export default function HowItWorksPage() {
  return (
    <PublicPage>
      <p className="text-small font-medium text-brand-dark">Process</p>
      <h1 className="mt-2 max-w-2xl text-h1 text-navy">How SheharSaarthi works</h1>
      <p className="mt-2 max-w-prose text-body text-muted">
        A report becomes a numbered record, then work the city can assign and you
        can confirm.
      </p>
      <ol className="mt-10 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {workflowSteps.map((step, index) => {
          const Icon = STEP_ICONS[index] ?? Camera;
          return (
            <li key={step.title}>
              <ChoiceTileStatic>
                <span className="ss-choice-tile__icon">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span>
                  <span className="ss-choice-tile__muted">Step {index + 1}</span>
                  <span className="ss-choice-tile__title">{step.title}</span>
                  <span className="ss-choice-tile__muted">{step.description}</span>
                </span>
              </ChoiceTileStatic>
            </li>
          );
        })}
      </ol>
      <div className="mt-10">
        <ButtonLink href={PUBLIC_REPORT_HREF}>Report an issue</ButtonLink>
      </div>
    </PublicPage>
  );
}
