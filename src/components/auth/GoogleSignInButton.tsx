"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";

type GoogleSignInButtonProps = {
  callbackUrl?: string;
  label?: string;
};

export function GoogleSignInButton({
  callbackUrl = "/citizen",
  label = "Continue with Google",
}: GoogleSignInButtonProps) {
  return (
    <Button
      type="button"
      size="lg"
      className="w-full"
      onClick={() => signIn("google", { callbackUrl })}
    >
      {label}
    </Button>
  );
}
