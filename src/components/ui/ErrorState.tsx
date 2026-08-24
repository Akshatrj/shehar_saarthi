import { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type ErrorStateProps = {
  title?: string;
  description: string;
  onRetry?: () => void;
  action?: ReactNode;
};

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  action,
}: ErrorStateProps) {
  return (
    <Card className="flex flex-col items-start gap-2 border-danger-border bg-danger-bg">
      <CircleAlert className="h-5 w-5 text-danger" aria-hidden="true" strokeWidth={1.75} />
      <h2 className="text-h3 text-danger">{title}</h2>
      <p className="max-w-prose text-small text-danger/90">{description}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
      {action}
    </Card>
  );
}
