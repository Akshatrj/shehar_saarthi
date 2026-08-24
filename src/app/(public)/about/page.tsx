import type { Metadata } from "next";
import { PublicPage } from "@/components/layout/PublicPage";

export const metadata: Metadata = {
  title: "About",
  description:
    "SheharSaarthi means city companion: a civic platform connecting residents with municipal authorities.",
};

export default function AboutPage() {
  return (
    <PublicPage>
      <p className="text-small font-medium text-green-800">About</p>
      <h1 className="mt-2 max-w-2xl text-h1 text-green-950">
        SheharSaarthi is a city companion
      </h1>
      <p className="mt-2 max-w-prose text-body text-muted">
        Shehar means city. Saarthi means companion. The product sits between
        residents and the municipality — not as a generic dashboard.
      </p>
      <div className="mt-10 flex max-w-prose flex-col gap-8">
        <section>
          <h2 className="text-h3 text-green-950">What it is</h2>
          <p className="mt-2 text-body">
            Residents report civic problems with a photograph and a map pin.
            Municipal administrators verify, assign, and close that work. Field
            workers see the issue and the location — not the person who reported
            it.
          </p>
        </section>
        <section>
          <h2 className="text-h3 text-green-950">What it is not</h2>
          <p className="mt-2 text-body">
            It is not a social network or an emergency dispatch system.
            Duplicate reports are linked for review; they are not deleted
            because they look similar.
          </p>
        </section>
        <section>
          <h2 className="text-h3 text-green-950">Who it is for</h2>
          <p className="mt-2 text-body">
            Citizens who want a numbered record the city can act on.
            Administrators who need to route and close work. Field staff who
            need the job, not the complainant’s identity.
          </p>
        </section>
      </div>
    </PublicPage>
  );
}
