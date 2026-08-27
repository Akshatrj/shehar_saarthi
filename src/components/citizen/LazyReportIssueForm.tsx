"use client";

import dynamic from "next/dynamic";
import { ReportFormSkeleton } from "@/components/citizen/ReportFormSkeleton";

export const LazyReportIssueForm = dynamic(
  () =>
    import("@/components/citizen/ReportIssueForm").then((mod) => mod.ReportIssueForm),
  {
    loading: () => <ReportFormSkeleton />,
    ssr: false,
  },
);
