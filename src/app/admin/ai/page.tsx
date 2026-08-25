import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { getAiMonitoringStats } from "@/domains/admin/ai-monitoring";
import { COMPLAINT_CATEGORY_LABELS } from "@/domains/complaints/types";

export default async function AdminAiPage() {
  const stats = await getAiMonitoringStats();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Super admin"
        title="AI / Civic Intelligence"
        description="Gemini-powered complaint analysis monitoring. Core complaint flows continue even when AI is unavailable."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <CardDescription>Total AI requests</CardDescription>
          <CardTitle className="mt-2 text-2xl">{stats.total}</CardTitle>
        </Card>
        <Card className="p-4">
          <CardDescription>Successful (Gemini)</CardDescription>
          <CardTitle className="mt-2 text-2xl">{stats.success}</CardTitle>
        </Card>
        <Card className="p-4">
          <CardDescription>Manual fallbacks</CardDescription>
          <CardTitle className="mt-2 text-2xl">{stats.manualFallbacks}</CardTitle>
        </Card>
        <Card className="p-4">
          <CardDescription>Needs review</CardDescription>
          <CardTitle className="mt-2 text-2xl">{stats.needsReview}</CardTitle>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <CardDescription>P1 critical</CardDescription>
          <CardTitle className="mt-2 text-2xl">{stats.p1}</CardTitle>
        </Card>
        <Card className="p-4">
          <CardDescription>P2 high</CardDescription>
          <CardTitle className="mt-2 text-2xl">{stats.p2}</CardTitle>
        </Card>
        <Card className="p-4">
          <CardDescription>P3 medium</CardDescription>
          <CardTitle className="mt-2 text-2xl">{stats.p3}</CardTitle>
        </Card>
        <Card className="p-4">
          <CardDescription>P4 low</CardDescription>
          <CardTitle className="mt-2 text-2xl">{stats.p4}</CardTitle>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-h3 text-navy">Recent AI requests</h2>
          <p className="mt-1 text-small text-muted">
            Provider is always Gemini on the server. Citizens never see internal model details.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>When</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.recent.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-muted">
                  No AI requests logged yet.
                </TableCell>
              </TableRow>
            ) : (
              stats.recent.map((row) => (
                <TableRow key={row.requestId}>
                  <TableCell className="font-mono text-small">{row.requestId}</TableCell>
                  <TableCell className="text-small">
                    {row.createdAt.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-small">{row.status}</TableCell>
                  <TableCell className="text-small">
                    {row.category ? COMPLAINT_CATEGORY_LABELS[row.category] : "—"}
                  </TableCell>
                  <TableCell className="text-small">
                    {row.priority ?? "—"}
                    {row.priorityScore != null ? ` (${row.priorityScore})` : ""}
                  </TableCell>
                  <TableCell className="text-small">
                    {row.evidenceConsistency ?? "—"}
                  </TableCell>
                  <TableCell className="text-small">
                    {row.requiresManualReview ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="text-small">
                    {row.totalMs != null ? `${row.totalMs}ms` : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
