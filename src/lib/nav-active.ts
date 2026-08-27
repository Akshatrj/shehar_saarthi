import type { NavItem } from "@/components/layout/Navbar";

function itemPath(href: string) {
  return href.split("#")[0] || "/";
}

function pathMatches(pathname: string, href: string) {
  const path = itemPath(href);
  if (path === "/") {
    return pathname === "/";
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

/** Picks the most specific nav item for the current pathname (longest href wins). */
export function getActiveNavHref(items: NavItem[], pathname: string) {
  let activeHref: string | null = null;
  let activePathLength = -1;

  for (const item of items) {
    const path = itemPath(item.href);
    if (pathMatches(pathname, item.href) && path.length > activePathLength) {
      activeHref = item.href;
      activePathLength = path.length;
    }
  }

  return activeHref;
}

export function isNavItemActive(
  items: NavItem[],
  pathname: string,
  href: string,
) {
  return getActiveNavHref(items, pathname) === href;
}
