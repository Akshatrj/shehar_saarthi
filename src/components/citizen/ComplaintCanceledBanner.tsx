"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/Alert";

export function ComplaintCanceledBanner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";

  useEffect(() => {
    if (!canceled) {
      return;
    }
    const timer = window.setTimeout(() => {
      router.replace("/citizen");
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [canceled, router]);

  if (!canceled) {
    return null;
  }

  return (
    <Alert variant="success" title="Complaint canceled" live="polite">
      This report was removed from your dashboard and from staff queues.
    </Alert>
  );
}
