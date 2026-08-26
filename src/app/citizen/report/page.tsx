import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { LazyReportIssueForm } from "@/components/citizen/LazyReportIssueForm";

export default function CitizenReportPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Citizen"
        title="Report an issue"
        description="Pick a category, add a photo and description, then pin the location."
      />
      <Card className="p-4 sm:p-6">
        <CardHeader className="mb-4">
          <CardTitle>New complaint</CardTitle>
          <CardDescription>
            Three short steps. You do not need to know which department handles it.
          </CardDescription>
        </CardHeader>
        <LazyReportIssueForm />
      </Card>
    </div>
  );
}

