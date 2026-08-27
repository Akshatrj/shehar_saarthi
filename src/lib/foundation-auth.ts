import type { UserRole } from "@/domains/auth/types";

export type FoundationAccount = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
};

/** Demo email/password logins. Ignored when NODE_ENV is production. */
export function isFoundationAuthEnabled() {
  return (
    process.env.FOUNDATION_AUTH === "true" &&
    process.env.NODE_ENV !== "production"
  );
}

export const FOUNDATION_ACCOUNTS: readonly FoundationAccount[] = [
  {
    email: "citizen@sheharsaarthi.local",
    password: "citizen",
    name: "Teja Citizen",
    role: "CITIZEN",
  },
  {
    email: "admin@sheharsaarthi.local",
    password: "admin",
    name: "Municipal Admin",
    role: "SUPER_ADMIN",
  },
  {
    email: "worker@sheharsaarthi.local",
    password: "worker",
    name: "Field Worker",
    role: "WORKER",
  },
];
