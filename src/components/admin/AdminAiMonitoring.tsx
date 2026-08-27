import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
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

function formatWhen(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function shortRequestId(id: string) {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…`;
}

function statusTone(status: string): "success" | "warning" | "red" | "stone" {
  if (status === "SUCCESS") return "success";
  if (status === "MANUAL_FALLBACK") return "warning";
  if (status === "FAILURE") return "red";
  return "stone";
}

function statusLabel(status: string) {
  if (status === "SUCCESS") return "Gemini";
  if (status === "MANUAL_FALLBACK") return "Fallback";
  if (status === "FAILURE") return "Failed";
  return status;
}

function priorityTone(
  priority: string | null,
): "critical" | "high" | "medium" | "low" | "stone" {
  if (priority === "P1") return "critical";
  if (priority === "P2") return "high";
  if (priority === "P3") return "medium";
  if (priority === "P4") return "low";
  return "stone";
}

function evidenceTone(
  evidence: string | null,
): "success" | "warning" | "red" | "stone" {
  if (evidence === "CONSISTENT") return "success";
  if (evidence === "POTENTIAL_MISMATCH") return "red";
  if (evidence === "NEEDS_REVIEW") return "warning";
  return "stone";
}

function evidenceLabel(evidence: string | null) {
  if (evidence === "CONSISTENT") return "Consistent";
  if (evidence === "POTENTIAL_MISMATCH") return "Mismatch";
  if (evidence === "NEEDS_REVIEW") return "Needs review";
  if (evidence === "INCONCLUSIVE") return "Inconclusive";
  return evidence ?? "—";
}

function MetricGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-small font-semibold text-navy">{title}</h2>
        <p className="mt-0.5 text-xs text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

function SuccessRateChip({ rate }: { rate: number }) {
  return (
    <div className="inline-flex max-w-full items-center gap-2.5 rounded-lg border border-line bg-paper-raised px-2.5 py-2 shadow-sm">
      <span
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-white"
        aria-hidden
      >
        <Sparkles className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="text-small font-semibold leading-tight tabular-nums text-navy">
          {rate}%
        </p>
        <p className="text-xs text-muted">successful analyses</p>
      </div>
    </div>
  );
}

export async function AdminAiMonitoring() {
  const stats = await getAiMonitoringStats();
  const successRate =
    stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        className="sm:items-center"
        eyebrow="Super Admin"
        title="AI / Civic Intelligence"
        description="Gemini classifies complaints on the server. Routing and department assignment stay under Super Admin control even when AI is unavailable."
        actions={<SuccessRateChip rate={successRate} />}
      />

      <Card className="flex items-start gap-3 rounded-lg border-brand-200 bg-brand-50/40 p-4">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand">
          <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-small font-semibold text-navy">Gemini is optional</p>
          <p className="mt-0.5 text-xs text-muted">
            Citizens still submit by category. If Gemini is down, complaints keep
            flowing with deterministic routing.
          </p>
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        <MetricGroup
          title="Request volume"
          description="How often Gemini ran, and how often staff still need to step in."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total AI requests"
              value={stats.total}
              icon={Activity}
              tone="brand"
              hint="Logged Gemini calls"
            />
            <StatCard
              label="Successful"
              value={stats.success}
              icon={CheckCircle2}
              tone="success"
              hint="Structured JSON accepted"
            />
            <StatCard
              label="Manual fallbacks"
              value={stats.manualFallbacks}
              icon={TriangleAlert}
              tone="warning"
              hint="Citizen category used instead"
            />
            <StatCard
              label="Needs review"
              value={stats.needsReview}
              icon={AlertTriangle}
              tone="danger"
              hint="Low confidence or mismatch"
            />
          </div>
        </MetricGroup>

        <MetricGroup
          title="Priority mix"
          description="AI priority bands from civic-impact scoring — not final routing."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="P1 critical"
              value={stats.p1}
              icon={ShieldAlert}
              tone="critical"
              hint="Immediate safety risk"
            />
            <StatCard
              label="P2 high"
              value={stats.p2}
              icon={Zap}
              tone="high"
              hint="Urgent public impact"
            />
            <StatCard
              label="P3 medium"
              value={stats.p3}
              icon={Clock3}
              tone="medium"
              hint="Standard civic issue"
            />
            <StatCard
              label="P4 low"
              value={stats.p4}
              icon={ShieldCheck}
              tone="low"
              hint="Non-urgent follow-up"
            />
          </div>
        </MetricGroup>
      </div>

      {stats.recent.length === 0 ? (
        <EmptyState
          title="No AI requests yet"
          description="Submit a complaint with a photo to generate the first Gemini analysis. Core complaint flows continue even when AI is unavailable."
        />
      ) : (
        <Card className="overflow-hidden rounded-lg p-0 sm:p-0">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-small font-semibold text-navy">Recent AI requests</h2>
            <p className="mt-0.5 text-xs text-muted">
              Provider is always Gemini on the server. Citizens never see internal
              model details.
            </p>
          </div>
          <Table embedded caption="Recent AI classification requests">
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
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
              {stats.recent.map((row) => (
                <TableRow key={row.requestId}>
                  <TableCell>
                    <span
                      className="font-mono text-xs text-navy"
                      title={row.requestId}
                    >
                      {shortRequestId(row.requestId)}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-small text-muted">
                    {formatWhen(row.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge tone={statusTone(row.status)}>
                      {statusLabel(row.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-small">
                    {row.category ? COMPLAINT_CATEGORY_LABELS[row.category] : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge tone={priorityTone(row.priority)}>
                      {row.priority ?? "—"}
                      {row.priorityScore != null ? ` · ${row.priorityScore}` : ""}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.evidenceConsistency ? (
                      <Badge tone={evidenceTone(row.evidenceConsistency)}>
                        {evidenceLabel(row.evidenceConsistency)}
                      </Badge>
                    ) : (
                      <span className="text-small text-muted">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.requiresManualReview ? (
                      <Badge tone="warning">Review</Badge>
                    ) : (
                      <span className="text-small text-muted">Clear</span>
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums text-small text-muted">
                    {row.totalMs != null ? `${row.totalMs} ms` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
