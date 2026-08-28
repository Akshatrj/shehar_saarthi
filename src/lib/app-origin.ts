/**
 * Public site origin. Prefer AUTH_URL; fall back to Vercel’s deployment host.
 * Do not hard-code a *.vercel.app hostname — it changes with the project name.
 */
export function appOrigin() {
  const fromAuth = process.env.AUTH_URL?.trim();
  if (fromAuth) {
    return fromAuth.replace(/\/$/, "");
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

export const PRIVATE_PAGE_ROBOTS = {
  index: false,
  follow: false,
} as const;
