import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { UserRole } from "@/domains/auth/types";

export function resolveSessionRole(token: JWT): UserRole {
  if (
    token.role === "WORKER" ||
    token.role === "DEPARTMENT_ADMIN" ||
    token.role === "SUPER_ADMIN" ||
    token.role === "CITIZEN"
  ) {
    return token.role;
  }
  return "CITIZEN";
}

export async function mapAuthSession({
  session,
  token,
}: {
  session: Session;
  token: JWT;
}): Promise<Session> {
  const role = resolveSessionRole(token);

  return {
    ...session,
    user: {
      ...session.user,
      id:
        typeof token.userId === "string"
          ? token.userId
          : typeof token.sub === "string"
            ? token.sub
            : "",
      role,
      departmentId:
        typeof token.departmentId === "string" ? token.departmentId : null,
      isActive: token.isActive !== false,
    },
  };
}
