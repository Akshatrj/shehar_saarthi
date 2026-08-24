export const CITIZEN_REPORT_PATH = "/citizen/report";
export const CITIZEN_TRACK_PATH = "/citizen";

export function loginCallbackPath(path: string) {
  return `/login?callbackUrl=${encodeURIComponent(path)}`;
}

export const PUBLIC_REPORT_HREF = loginCallbackPath(CITIZEN_REPORT_PATH);
export const PUBLIC_TRACK_HREF = loginCallbackPath(CITIZEN_TRACK_PATH);
