"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Admin portal unavailable"
      description="We could not load this admin view. Your session may have expired, or the server had a temporary problem."
      onRetry={reset}
    />
  );
}
