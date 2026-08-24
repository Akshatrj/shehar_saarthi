import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export function DashboardInsightsFallback() {
  return (
    <div className="flex flex-col gap-4">
      <Card className="flex h-[520px] items-center justify-center p-5">
        <Spinner label="Loading map and analytics…" />
      </Card>
      <Card className="flex h-56 items-center justify-center p-5">
        <Spinner label="Loading charts…" />
      </Card>
    </div>
  );
}
