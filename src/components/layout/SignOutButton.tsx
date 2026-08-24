"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { signOut } from "next-auth/react";

type SignOutButtonProps = {
  callbackUrl: string;
};

export function SignOutButton({ callbackUrl }: SignOutButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await signOut({ redirect: false, callbackUrl });
        router.push(callbackUrl);
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
}
