import { randomBytes } from "node:crypto";
import { put } from "@vercel/blob";
import type { AllowedComplaintImageMime } from "@/domains/complaints/constants";
import { extensionForMime } from "@/domains/complaints/validation";

export class BlobStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlobStorageError";
  }
}

function assertBlobConfigured() {
  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    throw new BlobStorageError(
      "Photo storage is not configured. Set BLOB_READ_WRITE_TOKEN on the server.",
    );
  }
}

export async function uploadComplaintImage(input: {
  citizenId: string;
  bytes: Buffer;
  mimeType: AllowedComplaintImageMime;
}) {
  assertBlobConfigured();

  const extension = extensionForMime(input.mimeType);
  const objectId = randomBytes(16).toString("hex");
  const pathname = `complaints/${input.citizenId}/${objectId}.${extension}`;

  const blob = await put(pathname, input.bytes, {
    access: "public",
    contentType: input.mimeType,
    addRandomSuffix: false,
  });

  return blob.url;
}
