import type { ChartDatum } from "@/domains/admin/chart-data";

type StackedBarChartProps = {
  data: ChartDatum[];
};

export function StackedBarChart({ data }: StackedBarChartProps) {
  const active = data.filter((item) => item.count > 0);
  const total = active.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-line bg-brand-50/40 text-small text-muted">
        No department routing data yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex h-10 overflow-hidden rounded-full border border-line"
        role="img"
        aria-label="Department workload distribution"
      >
        {active.map((item) => {
          const width = (item.count / total) * 100;
          return (
            <div
              key={item.key}
              className="h-full transition-[width] duration-300"
              style={{
                width: `${width}%`,
                backgroundColor: item.color,
              }}
              title={`${item.label}: ${item.count}`}
            />
          );
        })}
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {active.map((item) => (
          <li
            key={item.key}
            className="flex items-center justify-between gap-3 rounded-md border border-line bg-paper px-3 py-2 text-small"
          >
            <span className="inline-flex items-center gap-2 font-medium text-ink">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden
              />
              {item.label}
            </span>
            <span className="tabular-nums text-muted">
              {item.count} ({Math.round((item.count / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
