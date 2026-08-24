import type { Metadata } from "next";
import { PublicPage } from "@/components/layout/PublicPage";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CatalogInteractive } from "@/components/public/CatalogInteractive";
import { Sidebar } from "@/components/layout/Sidebar";
import { colorSwatches } from "@/lib/tokens";
import { COMPLAINT_STATUSES } from "@/domains/complaints/types";
import { cn } from "@/lib/cn";
import { PUBLIC_REPORT_HREF } from "@/lib/public-routes";

export const metadata: Metadata = {
  title: "Design system",
};

const sampleRows = [
  {
    ref: "SS-2026-000118",
    category: "Pothole",
    status: "IN_PROGRESS" as const,
  },
  {
    ref: "SS-2026-000119",
    category: "Garbage",
    status: "SUBMITTED" as const,
  },
  {
    ref: "SS-2026-000120",
    category: "Water leakage",
    status: "ROUTED" as const,
  },
];

export default function DesignSystemPage() {
  return (
    <PublicPage>
    <div className="flex flex-col gap-12">
      <PageHeader
        eyebrow="Civic identity"
        title="SheharSaarthi design system"
        description="Reusable tokens and components for a trustworthy municipal platform."
      />

      <section className="flex flex-col gap-4">
        <h2>Colour</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {colorSwatches.map((swatch) => (
            <div key={swatch.name} className="flex flex-col gap-2">
              <div
                className={cn("h-16 rounded-md border border-line", swatch.className)}
              />
              <p className="text-small text-muted">{swatch.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Typography</h2>
        <p className="text-display font-semibold text-navy">Display — city voice</p>
        <h1>Heading 1 — Source Sans 3</h1>
        <h2>Heading 2 — municipal sections</h2>
        <h3>Heading 3 — cards and dialogs</h3>
        <p className="max-w-prose text-body">
          Body copy uses Source Sans 3 at a comfortable 1.5 line height so
          non-technical citizens can read instructions on a phone.
        </p>
        <p className="text-small text-muted">Small text for hints and metadata.</p>
        <p className="text-label font-medium">Form label</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Buttons</h2>
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
          <ButtonLink href="/design-system" variant="secondary">
            Button link
          </ButtonLink>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Cards</h2>
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Ward notice</CardTitle>
            <CardDescription>
              Raised paper surface, thin line, light shadow.
            </CardDescription>
          </CardHeader>
          <CardBody>Use cards for grouped civic information, not KPI tiles.</CardBody>
          <CardFooter>
            <Badge tone="green">Public service</Badge>
          </CardFooter>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Forms, modal, and toast</h2>
        <CatalogInteractive />
      </section>

      <section className="flex flex-col gap-3">
        <h2>Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Green</Badge>
          <Badge tone="blue">Blue</Badge>
          <Badge tone="stone">Stone</Badge>
          <Badge tone="red">Red</Badge>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Complaint status</h2>
        <div className="flex flex-wrap gap-2">
          {COMPLAINT_STATUSES.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Alerts</h2>
        <div className="grid gap-3">
          <Alert title="Information" variant="info">
            Your complaint number will appear after submission.
          </Alert>
          <Alert title="Resolved" variant="success">
            The municipality marked this work complete.
          </Alert>
          <Alert title="Action needed" variant="warning">
            Please confirm whether the issue is fixed.
          </Alert>
          <Alert title="Could not save" variant="danger" live="assertive">
            Check the form and try again.
          </Alert>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Table</h2>
        <Table caption="Sample civic complaints without citizen identity">
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleRows.map((row) => (
              <TableRow key={row.ref}>
                <TableCell className="font-medium">{row.ref}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Navigation sample</h2>
        <p className="text-small text-muted">
          Sidebar is a municipal menu with 44px targets, not an icon rail.
        </p>
        <div className="overflow-hidden rounded-md border border-line">
          <Sidebar
            title="Citizen"
            items={[
              { href: "/design-system", label: "Design system" },
              { href: "/dashboard", label: "Dashboard" },
              { href: PUBLIC_REPORT_HREF, label: "Report issue" },
            ]}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Empty, error, and loading</h2>
        <EmptyState
          title="No complaints in this ward"
          description="When residents report issues, they will appear in this list."
          action={<Button variant="secondary">Report an issue</Button>}
        />
        <ErrorState description="The municipal desk could not load this queue." />
        <div className="flex flex-col gap-4">
          <Spinner label="Loading complaints" />
          <SkeletonBlock lines={4} />
          <Skeleton className="h-24 w-full" />
        </div>
      </section>
    </div>
    </PublicPage>
  );
}

