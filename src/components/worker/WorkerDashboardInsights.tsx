import { ComplaintsMapSection } from "@/components/dashboard/ComplaintsMapSection";
import { getComplaintMapAnalytics } from "@/domains/complaints/dashboard-analytics";
import { requireWorkerContext } from "@/domains/complaints/worker-service";
import { requireWorker } from "@/lib/auth/require";

export async function WorkerDashboardInsights() {
  const user = await requireWorker();
  const workerContext = requireWorkerContext(user);
  const mapData = await getComplaintMapAnalytics({
    assignedWorkerId: workerContext.workerId,
  });

  return (
    <ComplaintsMapSection
      title="My assignments map"
      description="Complaints assigned to you plotted by location. Pins load lazily to keep the desk fast."
      complaints={mapData.mapComplaints}
      detailPathPrefix="/worker/complaints"
      mapTotalCount={mapData.mapTotalCount}
      mapTruncated={mapData.mapTruncated}
    />
  );
}
