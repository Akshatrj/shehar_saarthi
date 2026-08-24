import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-navy-light bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Logo variant="lockup" href="/" />
          <p className="max-w-sm text-small leading-relaxed text-navy-muted">
            A civic companion for reporting and resolving city issues. Field
            staff see the problem, not the person who reported it.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="text-small font-semibold uppercase tracking-wider text-brand-light">
            Platform
          </p>
          <ul className="mt-4 flex flex-col gap-1">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-small text-white/90 transition-colors hover:text-brand-light"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="text-small font-semibold uppercase tracking-wider text-brand-light">
            Staff desks
          </p>
          <p className="mt-4 text-small leading-relaxed text-navy-muted">
            This site is not an emergency service. For fire, crime, or medical
            help, use the numbers published by local authorities.
          </p>
          <div className="mt-4 flex flex-col items-start gap-1">
            <Link
              href="/login?callbackUrl=/admin"
              className="inline-flex min-h-11 items-center text-small text-brand-light underline-offset-2 hover:underline"
            >
              Super admin sign in
            </Link>
            <Link
              href="/login?callbackUrl=/worker"
              className="inline-flex min-h-11 items-center text-small text-brand-light underline-offset-2 hover:underline"
            >
              Staff sign in
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-navy-muted">
          © {new Date().getFullYear()} Shehar Saarthi · Civic Issue Portal
        </p>
      </div>
    </footer>
  );
}
