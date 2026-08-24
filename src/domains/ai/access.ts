const ALLOWED_IMAGE_HOST_SUFFIXES = [
  ".public.blob.vercel-storage.com",
] as const;

export function validateClassifyImageUrl(imageUrl: unknown): string {
  if (typeof imageUrl !== "string") {
    throw new Error("imageUrl must be a string.");
  }

  const trimmed = imageUrl.trim();
  if (!trimmed) {
    throw new Error("imageUrl is required.");
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("imageUrl must be a valid URL.");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("imageUrl must use HTTPS.");
  }

  const hostAllowed = ALLOWED_IMAGE_HOST_SUFFIXES.some((suffix) =>
    parsed.hostname.endsWith(suffix),
  );
  if (!hostAllowed) {
    throw new Error("imageUrl must point to an allowed evidence photo host.");
  }

  return trimmed;
}
