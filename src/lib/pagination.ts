export const DEFAULT_PAGE_SIZE = 40;
export const MAX_PAGE = 200;

export function parsePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }
  return Math.min(parsed, MAX_PAGE);
}

export function pageOffset(page: number, pageSize = DEFAULT_PAGE_SIZE) {
  return (page - 1) * pageSize;
}

export function takePlusOne(pageSize = DEFAULT_PAGE_SIZE) {
  return pageSize + 1;
}

export function slicePage<T>(rows: T[], pageSize = DEFAULT_PAGE_SIZE) {
  const hasMore = rows.length > pageSize;
  return {
    items: hasMore ? rows.slice(0, pageSize) : rows,
    hasMore,
  };
}

export function pageQuery(params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params);
  if (page <= 1) {
    next.delete("page");
  } else {
    next.set("page", String(page));
  }
  const query = next.toString();
  return query ? `?${query}` : "";
}
