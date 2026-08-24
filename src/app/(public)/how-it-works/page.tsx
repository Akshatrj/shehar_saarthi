import type { Metadata } from "next";
import { PublicPage } from "@/components/layout/PublicPage";
import { ButtonLink } from "@/components/ui/Button";
import { workflowSteps } from "@/content/landing";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How SheharSaarthi takes a civic report from photo to citizen-verified resolution.",
};

export default function HowItWorksPage() {
  return (
    <PublicPage>
      <p className="text-small font-medium text-green-800">Process</p>
      <h1 className="mt-2 max-w-2xl text-h1 text-green-950">
        How SheharSaarthi works
      </h1>
      <p className="mt-2 max-w-prose text-body text-muted">
        A report becomes a numbered record, then work the city can assign and
        you can confirm.
      </p>
      <ol className="mt-10 flex max-w-prose flex-col gap-8">
        {workflowSteps.map((step, index) => (
          <li key={step.title}>
            <p className="text-small font-semibold text-green-800">{index + 1}</p>
            <h2 className="mt-1 text-h3 text-green-950">{step.title}</h2>
            <p className="mt-1 text-body text-muted">{step.description}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10">
        <ButtonLink href="/report">Report an issue</ButtonLink>
      </div>
    </PublicPage>
  );
}
