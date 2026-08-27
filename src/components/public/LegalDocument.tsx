import { ReactNode } from "react";
import { PublicPage } from "@/components/layout/PublicPage";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";

type LegalDocumentProps = {
  title: string;
  description: ReactNode;
  children: ReactNode;
};

export function LegalDocument({
  title,
  description,
  children,
}: LegalDocumentProps) {
  return (
    <PublicPage>
      <PageHeader title={title} description={description} />
      <p className="mt-2 text-small text-muted">Last updated 18 August 2026</p>
      <article className="mt-8 max-w-prose space-y-8 text-body">{children}</article>
      <div className="mt-8">
        <ButtonLink href="/" variant="secondary">
          Back to home
        </ButtonLink>
      </div>
    </PublicPage>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-h3 text-green-950">{title}</h2>
      <div className="mt-2 flex flex-col gap-3">{children}</div>
    </section>
  );
}
