import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
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
        <CardHeader className="mb-4">
          <CardTitle>Complaint details</CardTitle>
          <CardDescription>
            All fields are required. Your report is sent to the municipal team after
            you sign in.
          </CardDescription>
        </CardHeader>
        <ReportIssueForm />
      </Card>
    </div>
  );
}

