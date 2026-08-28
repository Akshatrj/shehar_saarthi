import type { MetadataRoute } from "next";
import { appOrigin } from "@/lib/app-origin";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/citizen",
        "/citizen/",
        "/worker",
        "/worker/",
        "/department-admin",
        "/department-admin/",
        "/admin",
        "/admin/",
        "/staff/",
        "/api/",
        "/design-system",
      ],
    },
    sitemap: `${appOrigin()}/sitemap.xml`,
  };
}
