import { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Card } from "@/components/ui/Card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-start gap-2 border-dashed">
      <Inbox className="h-5 w-5 text-brand" aria-hidden="true" strokeWidth={1.75} />
      <h2 className="text-h3 text-navy">{title}</h2>
      <p className="max-w-prose text-small text-muted">{description}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </Card>
  );
}
