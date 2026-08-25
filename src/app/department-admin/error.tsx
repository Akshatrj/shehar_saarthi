"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function DepartmentAdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Could not load department desk"
      description="Try again in a moment. If the problem continues, sign out and sign back in."
      onRetry={reset}
    />
  );
}
