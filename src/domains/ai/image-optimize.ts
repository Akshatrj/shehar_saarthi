import sharp from "sharp";

const MAX_AI_EDGE_PX = 1280;
const MAX_AI_BYTES = 900_000;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export type OptimizedImage = {
  bytes: Buffer;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  width: number;
  height: number;
  wasOptimized: boolean;
};

function detectMime(bytes: Buffer): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export async function fetchAndOptimizeComplaintImage(
  imageUrl: string,
): Promise<OptimizedImage> {
  const response = await fetch(imageUrl, { signal: AbortSignal.timeout(12_000) });
  if (!response.ok) {
    throw new Error("Could not download complaint image for analysis.");
  }

  const headerType = response.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
  const bytes = Buffer.from(await response.arrayBuffer());
  const sniffed = detectMime(bytes);
  const mimeType = sniffed ?? (ALLOWED_MIME.has(headerType) ? (headerType as OptimizedImage["mimeType"]) : null);

  if (!mimeType || !ALLOWED_MIME.has(mimeType)) {
    throw new Error("Unsupported image format for AI analysis.");
  }

  const metadata = await sharp(bytes).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  const needsResize =
    width > MAX_AI_EDGE_PX || height > MAX_AI_EDGE_PX || bytes.length > MAX_AI_BYTES;

  if (!needsResize) {
    return { bytes, mimeType, width, height, wasOptimized: false };
  }

  let pipeline = sharp(bytes, { failOn: "none" }).rotate();
  if (width > MAX_AI_EDGE_PX || height > MAX_AI_EDGE_PX) {
    pipeline = pipeline.resize({
      width: MAX_AI_EDGE_PX,
      height: MAX_AI_EDGE_PX,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const optimized =
    mimeType === "image/png"
      ? await pipeline.png({ compressionLevel: 8 }).toBuffer({ resolveWithObject: true })
      : mimeType === "image/webp"
        ? await pipeline.webp({ quality: 82 }).toBuffer({ resolveWithObject: true })
        : await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer({ resolveWithObject: true });

  return {
    bytes: optimized.data,
    mimeType,
    width: optimized.info.width,
    height: optimized.info.height,
    wasOptimized: true,
  };
}
