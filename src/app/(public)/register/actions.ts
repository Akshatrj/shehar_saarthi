"use server";

import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { postLoginPath, safeAuthCallbackUrl } from "@/lib/auth-callback";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/domains/auth/password";
import { validateRegisterFields } from "@/domains/auth/register";
import { isSuperAdminEmail } from "@/domains/auth/sync-user";

function registerErrorUrl(code: string, callbackUrl: string) {
  return `/register?error=${code}&callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

export async function registerWithCredentials(
  callbackUrl: string,
  formData: FormData,
) {
  const fallback = safeAuthCallbackUrl(callbackUrl);
  const validated = validateRegisterFields({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!validated.ok) {
    redirect(registerErrorUrl(validated.code, fallback));
  }

  if (isSuperAdminEmail(validated.email)) {
    redirect(registerErrorUrl("oauth", fallback));
  }

  const existing = await prisma.user.findUnique({
    where: { email: validated.email },
    select: { passwordHash: true },
  });

  if (existing) {
    redirect(
      registerErrorUrl(existing.passwordHash ? "exists" : "oauth", fallback),
    );
  }

  try {
    await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        passwordHash: await hashPassword(validated.password),
        role: "CITIZEN",
        departmentId: null,
        isActive: true,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirect(registerErrorUrl("exists", fallback));
    }
    redirect(registerErrorUrl("database", fallback));
  }

  const redirectTo = postLoginPath(fallback, "CITIZEN");

  try {
    await signIn("credentials", {
      email: validated.email,
      password: validated.password,
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
