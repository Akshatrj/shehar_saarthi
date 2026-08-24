import { ButtonLink } from "@/components/ui/Button";

type PaginationNavProps = {
  page: number;
  hasMore: boolean;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
};

export function PaginationNav({
  page,
  hasMore,
  basePath,
  searchParams = {},
}: PaginationNavProps) {
  if (page <= 1 && !hasMore) {
    return null;
  }

  function hrefFor(nextPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) {
        params.set(key, value);
      }
    }
    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center gap-2">
      {page > 1 ? (
        <ButtonLink href={hrefFor(page - 1)} variant="secondary" size="sm">
          Previous
        </ButtonLink>
      ) : null}
      <p className="text-small text-muted">Page {page}</p>
      {hasMore ? (
        <ButtonLink href={hrefFor(page + 1)} variant="secondary" size="sm">
          Next
        </ButtonLink>
      ) : null}
    </nav>
  );
}
