"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { postLoginPath, safeAuthCallbackUrl } from "@/lib/auth-callback";
import { authorizeCredentials } from "@/domains/auth/credentials";
import type { UserRole } from "@/domains/auth/types";

export async function signInWithGoogle(
  callbackUrl: string,
  pickAccount = false,
) {
  await signIn(
    "google",
    { redirectTo: safeAuthCallbackUrl(callbackUrl) },
    pickAccount ? { prompt: "select_account" } : undefined,
  );
}

export async function signInWithCredentials(
  callbackUrl: string,
  formData: FormData,
) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fallback = safeAuthCallbackUrl(callbackUrl);
  const authorized = await authorizeCredentials({ email, password });
  const redirectTo = authorized?.role
    ? postLoginPath(fallback, authorized.role as UserRole)
    : fallback;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const reason =
        error.type === "CredentialsSignin" ? "CredentialsSignin" : "Configuration";
      redirect(
        `/login?error=${reason}&callbackUrl=${encodeURIComponent(redirectTo)}`,
      );
    }
    throw error;
  }
}
