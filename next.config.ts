import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
    middlewareClientMaxBodySize: "8mb",
    optimizePackageImports: [
      "leaflet",
      "leaflet.markercluster",
      "lucide-react",
      "next-auth",
      "next-auth/react",
    ],
  },
  async redirects() {
    return [
      {
        source: "/report",
        destination: "/login?callbackUrl=%2Fcitizen%2Freport",
        permanent: false,
      },
      {
        source: "/complaints",
        destination: "/login?callbackUrl=%2Fcitizen",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=(self)",
          },
          {
            key: "Content-Security-Policy",
            value:
              "base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: blob: https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://*.openstreetmap.org https://*.public.blob.vercel-storage.com",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
