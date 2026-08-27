import type { Metadata } from "next";
import { AboutEditorial } from "@/components/public/AboutEditorial";

export const metadata: Metadata = {
  title: "About",
  description:
    "SheharSaarthi connects citizens with the people who keep the city running — report, pin, and track civic issues together.",
};

export default function AboutPage() {
  return <AboutEditorial />;
}
