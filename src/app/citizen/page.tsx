import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { PaginationNav } from "@/components/ui/PaginationNav";
import { Card } from "@/components/ui/Card";
import { CitizenStatsGrid } from "@/components/citizen/CitizenStatsGrid";
import { ComplaintList } from "@/components/citizen/ComplaintList";
import {
  getCitizenComplaintStats,
  listCitizenComplaintsPage,
  parseCitizenPage,
} from "@/domains/complaints/citizen-tracking";
import { requireCitizenPortal } from "@/lib/auth/require";

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function CitizenHomePage({ searchParams }: PageProps) {
  const user = await requireCitizenPortal();
  const params = await searchParams;
  const page = parseCitizenPage(params.page);

  const [stats, list] = await Promise.all([
    getCitizenComplaintStats(user.id),
    listCitizenComplaintsPage(user, page),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Citizen"
        title="My complaints"
        description={`Signed in as ${user.name ?? user.email}. Track reports you have filed.`}
        actions={
          <ButtonLink href="/citizen/report" size="sm">
            Report an issue
          </ButtonLink>
        }
      />

      <CitizenStatsGrid stats={stats} />

      <Card className="flex flex-col gap-4 p-5">
        <div>
          <h2 className="text-h3 text-navy">Your reports</h2>
          <p className="mt-1 text-small text-muted">
            Open a complaint card to view details and track progress.
          </p>
        </div>
        <ComplaintList complaints={list.complaints} />
        <PaginationNav page={list.page} hasMore={list.hasMore} basePath="/citizen" />
      </Card>
    </div>
  );
}
