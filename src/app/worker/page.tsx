import { Suspense } from "react";
import { DashboardInsightsFallback } from "@/components/dashboard/DashboardInsightsFallback";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { PaginationNav } from "@/components/ui/PaginationNav";
import { WorkerComplaintFilters } from "@/components/worker/WorkerComplaintFilters";
import { WorkerComplaintTable } from "@/components/worker/WorkerComplaintTable";
import { WorkerDashboardInsights } from "@/components/worker/WorkerDashboardInsights";
import { WorkerStatsGrid } from "@/components/worker/WorkerStatsGrid";
import {
  getWorkerComplaintStats,
  listWorkerComplaints,
  parseWorkerPage,
  parseWorkerStatusFilter,
  requireWorkerContext,
  WorkerComplaintError,
} from "@/domains/complaints/worker-service";
import { requireWorker } from "@/lib/auth/require";

type PageProps = {
  searchParams: Promise<{ status?: string; page?: string }>;
};

export default async function WorkerHomePage({ searchParams }: PageProps) {
  const user = await requireWorker();
  const params = await searchParams;

  let workerContext;
  try {
    workerContext = requireWorkerContext(user);
  } catch (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Worker"
          title="My assigned complaints"
          description="Complaints assigned to you appear here."
        />
        <Card className="p-5">
          <CardTitle>{user.name ?? user.email}</CardTitle>
          <CardDescription className="mt-2">
            {error instanceof WorkerComplaintError
              ? error.message
              : "Your account cannot access the worker dashboard yet."}
          </CardDescription>
        </Card>
      </div>
    );
  }

  let statusFilter;
  try {
    statusFilter = parseWorkerStatusFilter(params.status);
  } catch {
    statusFilter = undefined;
  }

  const page = parseWorkerPage(params.page);
  const [stats, list] = await Promise.all([
    getWorkerComplaintStats(workerContext.workerId),
    listWorkerComplaints(workerContext, {
      status: statusFilter,
      page,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Worker"
        title="My assigned complaints"
        description={`Signed in as ${user.name ?? user.email}. Pick up routed complaints or continue assigned work.`}
      />

      <WorkerStatsGrid stats={stats} />

      <Suspense fallback={<DashboardInsightsFallback />}>
        <WorkerDashboardInsights />
      </Suspense>

      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-h3 text-navy">Complaints</h2>
          <p className="text-small text-muted">
            Routed complaints in your department can be self-assigned. Open a
            complaint to update progress.
          </p>
        </div>

        <WorkerComplaintFilters currentStatus={statusFilter} />
        <WorkerComplaintTable complaints={list.complaints} />
        <PaginationNav
          page={list.page}
          hasMore={list.hasMore}
          basePath="/worker"
          searchParams={{ status: statusFilter }}
        />
      </Card>
    </div>
  );
}
