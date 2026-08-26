import type { Metadata, Viewport } from "next";
import { Source_Sans_3 } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { auth } from "@/lib/auth";
import "./globals.css";
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SheharSaarthi",
    template: "%s · SheharSaarthi",
  },
  description:
    "Shehar Saarthi — Civic Issue Portal. Report and track civic issues with your municipality.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a192f",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("[auth] root session read failed", error);
  }

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${sourceSans.variable} font-sans antialiased`}>
        <AppProviders session={session}>{children}</AppProviders>
      </body>
    </html>
  );
}
