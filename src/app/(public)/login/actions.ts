"use server";

import { signIn } from "@/lib/auth";

export async function signInWithGoogle(
  callbackUrl: string,
  pickAccount = false,
) {
  await signIn(
    "google",
    { redirectTo: callbackUrl },
    pickAccount ? { prompt: "select_account" } : undefined,
  );
}
