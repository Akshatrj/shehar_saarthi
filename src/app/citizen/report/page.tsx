import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ReportIssueForm } from "@/components/citizen/ReportIssueForm";

export default function CitizenReportPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Citizen"
        title="Report an issue"
        description="Upload a photograph, describe the problem, and share where it is located."
      />
      <Card className="p-5 sm:p-6">
        <ReportIssueForm />
      </Card>
    </div>
  );
}
