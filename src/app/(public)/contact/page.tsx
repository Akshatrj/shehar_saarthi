import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, LegalSection } from "@/components/public/LegalDocument";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "How to report a civic issue on SheharSaarthi, sign in, or reach municipal and field desks.",
};

const desks = [
  {
    href: "/report",
    label: "Report an issue",
    detail: "Sign in as a citizen, then submit a photo and location.",
  },
  {
    href: "/complaints",
    label: "Track your reports",
    detail: "Open the status of complaints filed from your account.",
  },
  {
    href: "/login",
    label: "Citizen login",
    detail: "For residents who already have an account.",
  },
  {
    href: "/register",
    label: "Create a citizen account",
    detail: "Register with your name and email.",
  },
  {
    href: "/admin/login",
    label: "Municipal staff login",
    detail: "Administrators who verify, assign, and close work.",
  },
  {
    href: "/staff-login",
    label: "Field worker login",
    detail: "Assigned jobs only. Citizen identity is not shown.",
  },
] as const;

export default function ContactPage() {
  return (
    <LegalDocument
      title="Contact"
      description="Use the product desks below. This page does not send email, and it is not an emergency line."
    >
      <LegalSection title="Civic reports">
        <p>
          The supported way to raise a civic issue is through Report an issue
          after you sign in. You will need a photograph and a map location.
          Status updates appear on the complaint page and in your
          notifications.
        </p>
        <ul className="flex flex-col gap-3">
          {desks.map((desk) => (
            <li key={desk.href}>
              <Link
                href={desk.href}
                className="font-medium text-green-800 underline"
              >
                {desk.label}
              </Link>
              <p className="text-small text-muted">{desk.detail}</p>
            </li>
          ))}
        </ul>
      </LegalSection>

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
