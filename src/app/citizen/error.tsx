"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function CitizenError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Could not load this page"
      description="Your session may have expired, or the server had a temporary problem. Try again or return to your dashboard."
      onRetry={reset}
    />
  );
}
