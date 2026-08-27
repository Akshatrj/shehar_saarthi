import type { Metadata } from "next";
import { PrivacyContent } from "@/components/public/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What SheharSaarthi collects, why we need it, and who can see your civic reports.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
