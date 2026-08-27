import { Button, ButtonLink } from "@/components/ui/Button";
import type { CitizenComplaintSummary } from "@/domains/complaints/constants";
import { CheckCircle2 } from "lucide-react";

type ComplaintSuccessPanelProps = {
  complaint: CitizenComplaintSummary;
  onReportAnother: () => void;
};

export function ComplaintSuccessPanel({
  complaint,
  onReportAnother,
}: ComplaintSuccessPanelProps) {
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-success-border bg-success-bg/40 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <CheckCircle2
          className="mt-0.5 h-8 w-8 shrink-0 text-success"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <div>
          <h2 className="text-h2 text-navy">Complaint submitted successfully</h2>
          <p className="mt-2 text-body text-muted">
            Your complaint has been registered. Our team will review the AI
            routing recommendation and assign it to the right department.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-paper-raised px-4 py-3">
        <p className="text-small text-muted">Complaint ID</p>
        <p className="mt-1 font-mono text-h3 font-semibold text-brand">
          {complaint.publicRef}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <ButtonLink href={`/citizen/complaints/${complaint.id}`} className="ss-btn-civic">
          Track complaint
        </ButtonLink>
        <ButtonLink href="/citizen" variant="secondary">
          View my complaints
        </ButtonLink>
        <Button type="button" variant="ghost" onClick={onReportAnother}>
          Report another issue
        </Button>
      </div>
    </div>
  );
}
