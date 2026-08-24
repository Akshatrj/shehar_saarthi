import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/public/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How SheharSaarthi collects civic reports, who can see citizen identity, and how evidence is stored.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy"
      description="SheharSaarthi is a civic reporting product. This notice describes what the software actually collects and who can see it. It is not a substitute for a city-specific notice once a municipality names a grievance officer."
    >
      <LegalSection title="Who this notice covers">
        <p>
          This applies to residents who create a citizen account, municipal
          administrators who use the admin desk, and field workers who use the
          staff desk. If a city later publishes its own privacy notice, that
          notice will take precedence for that programme.
        </p>
      </LegalSection>

      <LegalSection title="What we collect">
        <p>When you use SheharSaarthi, the product may store:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Account details: name, email, and password (stored hashed).</li>
          <li>
            Civic reports: category, description, map coordinates, and a
            location label you confirm.
          </li>
          <li>
            Photographs you upload as issue evidence or as a follow-up after
            resolution.
          </li>
          <li>
            Session cookies used to keep you signed in (Auth.js session
            tokens).
          </li>
          <li>
            Status history, assignment records, and in-app notifications tied
            to a report.
          </li>
        </ul>
        <p>
          We do not ask for payment details. The public map does not show
          names, phone numbers, or email addresses.
        </p>
      </LegalSection>

      <LegalSection title="Who can see what">
        <p>
          Citizen name, phone, and email are shown only to authorised
          administrators on the admin desk. Field-worker screens show the
          issue, photograph, and location — not who reported it. Maps and
          clustered “issue area” views are built without resident identity.
        </p>
        <p>
          You can open your own reports after signing in. Duplicate reports
          may be linked for municipal review; they are not deleted solely
          because they look similar.
        </p>
      </LegalSection>

      <LegalSection title="Photographs and storage">
        <p>
          Evidence files are not published as public URLs. The app streams
          them only to a signed-in user who is allowed to see that complaint.
          On this deployment they are stored either on the server disk under a
          private <code className="text-small">storage/</code> folder, or in
          private Vercel Blob when the host is configured for it.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and sign-in">
        <p>
          Sign-in uses a session cookie. There is no advertising pixel and no
          third-party analytics SDK in this codebase. Demo logins, when
          enabled by operators, are for development only and are disabled in
          production.
        </p>
      </LegalSection>

      <LegalSection title="Retention and your choices">
        <p>
          Reports stay on file so the municipality can track work. A partner
          city should set its own retention and deletion policy before a public
          launch. You can review your reports in the app after signing in. This
          notice does not name a Data Protection Officer; that role must be
          published by the adopting municipality.
        </p>
      </LegalSection>

      <LegalSection title="Emergencies">
        <p>
          SheharSaarthi is not an emergency service. For fire, crime, or
          medical emergencies, use the numbers published by local authorities.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
