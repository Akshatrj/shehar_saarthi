import type { MetadataRoute } from "next";
import { appOrigin } from "@/lib/app-origin";

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/how-it-works",
  "/contact",
  "/privacy",
  "/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = appOrigin();
  return PUBLIC_PATHS.map((path) => ({
    url: path === "/" ? origin : `${origin}${path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
