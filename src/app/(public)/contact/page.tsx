import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/public/LegalDocument";

const SUPPORT_EMAIL = "tejasawasthi007@gmail.com";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Product support and emergency guidance for SheharSaarthi users.",
};

export default function ContactPage() {
  return (
    <LegalDocument
      title="Contact"
      description={
        <>
          For product support, email{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-brand underline underline-offset-2 hover:text-brand-dark"
          >
            {SUPPORT_EMAIL}
          </a>
          . This is not an emergency line.
        </>
      }
    >
      <LegalSection title="City helpline">
        <p>
          A public email inbox and municipal helpline are not attached to this
          site yet. When a partner city publishes those details, they will
          appear in the footer under Civic information.
        </p>
      </LegalSection>

      <LegalSection title="Emergencies">
        <p>
          Do not use SheharSaarthi for fire, crime, or medical emergencies.
          Call the numbers published by your local authorities.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
