"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";

type AppProvidersProps = {
  children: ReactNode;
  session?: Session | null;
};

export function AppProviders({ children, session = null }: AppProvidersProps) {
  return (
    <SessionProvider session={session} basePath="/api/auth" refetchOnWindowFocus>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
