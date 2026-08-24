"use server";

import { revalidatePath } from "next/cache";
import { requireWorker } from "@/lib/auth/require";
import {
  assignComplaintToSelf,
  completeWorkerComplaint,
  requireWorkerContext,
  startComplaintProgress,
  WorkerComplaintError,
  type WorkerContext,
} from "@/domains/complaints/worker-service";

export type WorkerActionResult = { ok: true } | { ok: false; error: string };

function failure(message: string): WorkerActionResult {
  return { ok: false, error: message };
}

function revalidateWorkerComplaint(complaintId: string) {
  revalidatePath("/worker");
  revalidatePath(`/worker/complaints/${complaintId}`);
}

async function runWorkerAction(
  complaintId: string,
  action: (worker: WorkerContext) => Promise<void>,
): Promise<WorkerActionResult> {
  try {
    const user = await requireWorker();
    if (!complaintId?.trim()) {
      return failure("Complaint id is required.");
    }
    const worker = requireWorkerContext(user);
    await action(worker);
    revalidateWorkerComplaint(complaintId.trim());
    return { ok: true };
  } catch (error) {
    if (error instanceof WorkerComplaintError) {
      return failure(error.message);
    }
    console.error("worker action failed", error);
    return failure("Could not update the complaint. Please try again.");
  }
}

export async function assignToSelf(
  complaintId: string,
): Promise<WorkerActionResult> {
  return runWorkerAction(complaintId, (worker) =>
    assignComplaintToSelf(worker, complaintId.trim()),
  );
}

export async function startProgress(
  complaintId: string,
): Promise<WorkerActionResult> {
  return runWorkerAction(complaintId, (worker) =>
    startComplaintProgress(worker, complaintId.trim()),
  );
}

export async function markCompleted(
  complaintId: string,
): Promise<WorkerActionResult> {
  return runWorkerAction(complaintId, (worker) =>
    completeWorkerComplaint(worker, complaintId.trim()),
  );
}
