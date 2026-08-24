import { prisma as basePrisma } from "../../prisma/client";
import { resolveDatabaseUrl } from "@/lib/database-url";

export type { PrismaClient } from "@prisma/client";

export async function getPrisma() {
  if (!resolveDatabaseUrl()) {
    return null;
  }
  return basePrisma;
}

export const prisma = basePrisma;
