"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-paper p-6 font-sans text-ink antialiased">
        <div className="mx-auto flex min-h-dvh max-w-lg items-center">
          <ErrorState
            title="Something went wrong"
            description="Shehar Saarthi hit an unexpected error. You can try again or return to the homepage."
            onRetry={reset}
          />
        </div>
      </body>
    </html>
  );
}
