import { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PublicNavActions } from "@/components/layout/PublicNavActions";
import { SkipLink } from "@/components/layout/SkipLink";
import { PUBLIC_REPORT_HREF, PUBLIC_TRACK_HREF } from "@/lib/public-routes";

export const publicNavItems = [
  { href: "/", label: "Home" },
  { href: PUBLIC_REPORT_HREF, label: "Report Issue" },
  { href: PUBLIC_TRACK_HREF, label: "Track Complaint" },
  { href: "/login?callbackUrl=/citizen", label: "My Complaints" },
];

type PublicShellProps = {
  children: ReactNode;
  actions?: ReactNode;
};

export function PublicShell({ children, actions }: PublicShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <SkipLink />
      <Navbar items={publicNavItems} actions={actions ?? <PublicNavActions />} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
