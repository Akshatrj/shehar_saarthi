import type { Metadata } from "next";
import { LandingPage } from "@/components/public/LandingPage";
import { appOrigin } from "@/lib/app-origin";

export const metadata: Metadata = {
  title: {
    absolute: "SheharSaarthi — Your City. Your Voice. Your Change.",
  },
  description:
    "SheharSaarthi is a civic platform for reporting, tracking, and resolving city issues — potholes, street lights, garbage, drainage, and more — with transparent status and protected citizen identity.",
  keywords: [
    "civic issues",
    "complaint tracking",
    "municipality",
    "potholes",
    "street lights",
    "SheharSaarthi",
  ],
  openGraph: {
    title: "SheharSaarthi — Your City. Your Voice. Your Change.",
    description:
      "Report civic problems and track their resolution with your municipality.",
    type: "website",
    locale: "en_IN",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SheharSaarthi",
  description:
    "Civic issue reporting and resolution platform for citizens and municipalities.",
  slogan: "Your City. Your Voice. Your Change.",
  url: appOrigin(),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
