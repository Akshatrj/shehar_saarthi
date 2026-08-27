import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { PaginationNav } from "@/components/ui/PaginationNav";
import { Card } from "@/components/ui/Card";
import { CitizenStatsGrid } from "@/components/citizen/CitizenStatsGrid";
import { ComplaintCanceledBanner } from "@/components/citizen/ComplaintCanceledBanner";
import { LazyComplaintListWithSearch } from "@/components/citizen/LazyComplaintListWithSearch";
import {
  getCitizenComplaintStats,
  listCitizenComplaintsPage,
  parseCitizenPage,
} from "@/domains/complaints/citizen-tracking";
import { requireCitizen } from "@/lib/auth/require";

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function CitizenHomePage({ searchParams }: PageProps) {
  const user = await requireCitizen();
  const params = await searchParams;
  const page = parseCitizenPage(params.page);

  const [stats, list] = await Promise.all([
    getCitizenComplaintStats(user.id),
    listCitizenComplaintsPage(user, page),
  ]);

  const displayName = user.name?.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Citizen dashboard"
        title={`Welcome back, ${displayName}`}
        description="Track the complaints you have filed and follow their progress."
        actions={
          <ButtonLink href="/citizen/report" size="sm" className="ss-btn-civic">
            Report an issue
          </ButtonLink>
        }
      />

      <Suspense fallback={null}>
        <ComplaintCanceledBanner />
      </Suspense>

      <CitizenStatsGrid stats={stats} />

      <Card className="flex flex-col gap-3 p-4 sm:p-5">
        <div>
          <h2 className="text-h3 text-navy">Recent complaints</h2>
          <p className="mt-1 text-small text-muted">
            Search by ID or description. Open a complaint to see the photo and
            timeline.
          </p>
        </div>
        <LazyComplaintListWithSearch complaints={list.complaints} />
        <PaginationNav page={list.page} hasMore={list.hasMore} basePath="/citizen" />
      </Card>
    </div>
  );
}
