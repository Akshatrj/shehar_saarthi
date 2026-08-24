import { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SkipLink } from "@/components/layout/SkipLink";

export const publicNavItems = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

type PublicShellProps = {
  children: ReactNode;
  actions?: ReactNode;
};

export function PublicShell({ children, actions }: PublicShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <SkipLink />
      <Navbar items={publicNavItems} actions={actions} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
