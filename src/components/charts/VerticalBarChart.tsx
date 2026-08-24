import type { ChartDatum } from "@/domains/admin/chart-data";

type VerticalBarChartProps = {
  data: ChartDatum[];
};

export function VerticalBarChart({ data }: VerticalBarChartProps) {
  const active = data.filter((item) => item.count > 0);
  const maxCount = Math.max(...active.map((item) => item.count), 1);
  const chartHeight = 180;
  const barWidth = 42;
  const gap = 18;
  const width = Math.max(active.length * (barWidth + gap) + gap, 240);

  if (active.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-md border border-dashed border-line bg-brand-50/40 text-small text-muted">
        No category data yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${chartHeight + 48}`}
        className="h-56 min-w-full"
        role="img"
        aria-label="Complaints by category"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = chartHeight - chartHeight * tick + 8;
          const value = Math.round(maxCount * tick);
          return (
            <g key={tick}>
              <line
                x1={gap}
                y1={y}
                x2={width - gap}
                y2={y}
                stroke="#e8edf3"
                strokeWidth={1}
              />
              <text
                x={4}
                y={y + 4}
                className="fill-muted text-[0.65rem]"
              >
                {value}
              </text>
            </g>
          );
        })}

        {active.map((item, index) => {
          const barHeight = Math.max((item.count / maxCount) * chartHeight, 8);
          const x = gap + index * (barWidth + gap);
          const y = chartHeight - barHeight + 8;
          return (
            <g key={item.key}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={6}
                fill={item.color}
              />
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                className="fill-navy text-[0.7rem] font-semibold"
              >
                {item.count}
              </text>
              <text
                x={x + barWidth / 2}
                y={chartHeight + 28}
                textAnchor="middle"
                className="fill-muted text-[0.62rem]"
              >
                {item.label.length > 12
                  ? `${item.label.slice(0, 11)}…`
                  : item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
