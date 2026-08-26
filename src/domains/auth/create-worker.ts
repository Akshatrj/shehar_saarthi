import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/domains/auth/password";
import { validateRegisterFields } from "@/domains/auth/register";

export class WorkerAccountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkerAccountError";
  }
}

export type WorkerAccountInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  departmentId: string;
};

export type CreatedWorkerAccount = {
  id: string;
  name: string;
  email: string;
  role: "WORKER";
  departmentId: string;
  isActive: boolean;
};

function workerFormError(code: "name" | "email" | "password" | "mismatch") {
  if (code === "name") {
    return "Enter a name between 2 and 80 characters.";
  }
  if (code === "email") {
    return "Enter a valid email address.";
  }
  if (code === "password") {
    return "Password must be between 8 and 72 characters.";
  }
  return "Passwords do not match.";
}

export async function createWorkerAccount(
  input: WorkerAccountInput,
): Promise<CreatedWorkerAccount> {
  const validated = validateRegisterFields(input);
  if (!validated.ok) {
    throw new WorkerAccountError(workerFormError(validated.code));
  }

  const departmentId = input.departmentId.trim();
  if (!departmentId) {
    throw new WorkerAccountError("Workers must be linked to a department.");
  }

  const department = await prisma.department.findFirst({
    where: { id: departmentId, isActive: true },
    select: { id: true },
  });
  if (!department) {
    throw new WorkerAccountError("Please choose an active department.");
  }

  const existing = await prisma.user.findUnique({
    where: { email: validated.email },
    select: { id: true },
  });
  if (existing) {
    throw new WorkerAccountError(
      "An account with this email already exists. Use a different email.",
    );
  }

  try {
    const worker = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        passwordHash: await hashPassword(validated.password),
        role: "WORKER",
        departmentId: department.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        isActive: true,
      },
    });

    if (worker.role !== "WORKER" || !worker.departmentId) {
      throw new WorkerAccountError("Workers must be linked to a department.");
    }

    return {
      id: worker.id,
      name: worker.name,
      email: worker.email,
      role: "WORKER",
      departmentId: worker.departmentId,
      isActive: worker.isActive,
    };
  } catch (error) {
    if (error instanceof WorkerAccountError) {
      throw error;
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new WorkerAccountError(
        "An account with this email already exists. Use a different email.",
      );
    }
    throw error;
  }
}
