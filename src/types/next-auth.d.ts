import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/domains/auth/types";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      departmentId: string | null;
      isActive: boolean;
    };
  }

  interface User {
    role?: UserRole;
    departmentId?: string | null;
    isActive?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: UserRole;
    departmentId?: string | null;
    isActive?: boolean;
  }
}
