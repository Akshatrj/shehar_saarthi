import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/public/LegalDocument";

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "Terms for using SheharSaarthi to report civic issues and for municipal staff to act on those reports.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of use"
      description="These terms describe how to use SheharSaarthi as a civic reporting product. A partner municipality may add programme rules before a public launch."
    >
      <LegalSection title="What this service is">
        <p>
          SheharSaarthi lets residents report civic issues with a photograph
          and a location, and lets municipal staff verify, assign, and close
          that work. It is a software layer between residents and a city
          office. It is not a police, fire, or ambulance dispatch system.
        </p>
      </LegalSection>

      <LegalSection title="Your account">
        <p>
          Keep your sign-in details to yourself. You are responsible for
          reports submitted from your account. If you are using a shared or
          demo account provided for training, do not enter personal data you
          would not give to a city office.
        </p>
      </LegalSection>

      <LegalSection title="Reports and photographs">
        <p>
          Submit reports that describe a real civic issue. Photographs are
          treated as evidence for that report. Do not upload images of
          unrelated people, private interiors, or content that is unlawful.
          Location pins should match where the problem is.
        </p>
        <p>
          The municipality may link similar reports, assign work, and ask you
          to confirm whether the issue is resolved. Linking duplicates does not
          erase the original filings.
        </p>
      </LegalSection>

      <LegalSection title="Staff use">
        <p>
          Administrators and field workers must use the desks only for
          municipal work. Field views omit citizen identity by design. Do not
          attempt to recover hidden personal data from maps or contractor
          screens.
        </p>
      </LegalSection>

      <LegalSection title="Availability">
        <p>
          The product may be unavailable during maintenance or network
          failures. Submitting a report does not guarantee a response time.
          Estimated completion dates, when shown, are operational targets, not
          contractual deadlines.
        </p>
      </LegalSection>

      <LegalSection title="Liability">
        <p>
          SheharSaarthi is provided for civic coordination. Operators are not
          liable for street conditions, contractor performance, or harm that
          follows from relying on this site instead of emergency services. Use
          of the software is at your own risk, to the extent permitted by
          applicable law in India.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          These terms may be updated when the product or a partner city
          programme changes. The date at the top of this page is the current
          version.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
