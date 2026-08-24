"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <ErrorState
        title="The page could not be loaded"
        description="Please try again. If the problem continues, return to the home page."
        onRetry={reset}
      />
    </div>
  );
}
