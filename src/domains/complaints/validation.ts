import {
  MAX_COMPLAINT_IMAGE_BYTES,
  type AllowedComplaintImageMime,
} from "@/domains/complaints/constants";

export class ComplaintValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ComplaintValidationError";
  }
}

function hasJpegMagic(bytes: Buffer) {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function hasPngMagic(bytes: Buffer) {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  );
}

function hasWebpMagic(bytes: Buffer) {
  return (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  );
}

export function detectImageMime(bytes: Buffer): AllowedComplaintImageMime | null {
  if (hasJpegMagic(bytes)) {
    return "image/jpeg";
  }
  if (hasPngMagic(bytes)) {
    return "image/png";
  }
  if (hasWebpMagic(bytes)) {
    return "image/webp";
  }
  return null;
}

export function extensionForMime(mime: AllowedComplaintImageMime) {
  if (mime === "image/jpeg") {
    return "jpg";
  }
  if (mime === "image/png") {
    return "png";
  }
  return "webp";
}

export function validateComplaintImage(bytes: Buffer, claimedType?: string) {
  if (!bytes.length) {
    throw new ComplaintValidationError("Please add a photograph of the problem.");
  }
  if (bytes.length > MAX_COMPLAINT_IMAGE_BYTES) {
    throw new ComplaintValidationError("Photos must be 8 MB or smaller.");
  }

  const detected = detectImageMime(bytes);
  if (!detected) {
    throw new ComplaintValidationError(
      "Please upload a JPEG, PNG, or WebP photograph.",
    );
  }

  if (
    claimedType &&
    claimedType !== "application/octet-stream" &&
    claimedType !== detected
  ) {
    throw new ComplaintValidationError(
      "The file type does not match a supported photograph format.",
    );
  }

  return detected;
}

export function validateComplaintDescription(value: unknown) {
  const description = typeof value === "string" ? value.trim() : "";
  if (description.length < 12) {
    throw new ComplaintValidationError(
      "Please describe the problem in at least 12 characters.",
    );
  }
  if (description.length > 4000) {
    throw new ComplaintValidationError(
      "Description is too long. Please shorten it to 4,000 characters.",
    );
  }
  return description;
}

export function validateOptionalContactPhone(value: unknown): string | null {
  if (value == null) {
    return null;
  }

  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) {
    return null;
  }

  const compact = raw.replace(/[\s-]/g, "");
  if (/^\d{10}$/.test(compact) || /^\+91\d{10}$/.test(compact)) {
    return compact;
  }

  throw new ComplaintValidationError(
    "Enter a 10-digit mobile number or +91 followed by 10 digits.",
  );
}

export function validateCoordinate(
  value: unknown,
  axis: "latitude" | "longitude",
): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.trim())
        : Number.NaN;

  if (!Number.isFinite(parsed)) {
    throw new ComplaintValidationError(
      axis === "latitude"
        ? "Latitude must be a valid number."
        : "Longitude must be a valid number.",
    );
  }

  if (axis === "latitude" && (parsed < -90 || parsed > 90)) {
    throw new ComplaintValidationError("Latitude must be between -90 and 90.");
  }

  if (axis === "longitude" && (parsed < -180 || parsed > 180)) {
    throw new ComplaintValidationError(
      "Longitude must be between -180 and 180.",
    );
  }

  return parsed;
}
