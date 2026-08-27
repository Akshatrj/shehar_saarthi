import { validatePassword } from "@/domains/auth/password";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegisterFields = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type RegisterValidation =
  | {
      ok: true;
      name: string;
      email: string;
      password: string;
    }
  | { ok: false; code: "name" | "email" | "password" | "mismatch" };

export function validateRegisterFields(
  input: RegisterFields,
): RegisterValidation {
  const name = input.name.trim();
  if (name.length < 2 || name.length > 80) {
    return { ok: false, code: "name" };
  }

  const email = input.email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { ok: false, code: "email" };
  }

  const passwordError = validatePassword(input.password);
  if (passwordError) {
    return { ok: false, code: "password" };
  }

  if (input.password !== input.confirmPassword) {
    return { ok: false, code: "mismatch" };
  }

  return { ok: true, name, email, password: input.password };
}
