import type { TrendDatum } from "@/domains/admin/chart-data";

type AreaTrendChartProps = {
  data: TrendDatum[];
};

export function AreaTrendChart({ data }: AreaTrendChartProps) {
  const maxCount = Math.max(...data.map((point) => point.count), 1);
  const width = 720;
  const height = 220;
  const padding = { top: 16, right: 16, bottom: 36, left: 36 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const points = data.map((point, index) => {
    const x =
      padding.left +
      (data.length <= 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
    const y =
      padding.top + innerHeight - (point.count / maxCount) * innerHeight;
    return { ...point, x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath = [
    linePath,
    `L ${points[points.length - 1]?.x ?? padding.left} ${padding.top + innerHeight}`,
    `L ${points[0]?.x ?? padding.left} ${padding.top + innerHeight}`,
    "Z",
  ].join(" ");

  const total = data.reduce((sum, point) => sum + point.count, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="text-small text-muted">
          Live from complaint records · last 30 days
        </p>
        <p className="text-small font-semibold text-navy">
          {total} new report{total === 1 ? "" : "s"}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-56 w-full"
        role="img"
        aria-label="Complaint trend over the last 30 days"
      >
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1565c0" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#1565c0" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((tick) => {
          const y = padding.top + innerHeight - innerHeight * tick;
          const value = Math.round(maxCount * tick);
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e8edf3"
                strokeWidth={1}
              />
              <text x={8} y={y + 4} className="fill-muted text-[0.65rem]">
                {value}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#trend-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#1565c0"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point) => (
          <g key={point.date}>
            <circle
              cx={point.x}
              cy={point.y}
              r={point.count > 0 ? 4 : 2.5}
              fill="#1565c0"
              {...(point.count > 0
                ? { "aria-label": `${point.label}: ${point.count}` }
                : {})}
            />
          </g>
        ))}

        {[0, Math.floor(data.length / 2), data.length - 1].map((index) => {
          const point = data[index];
          if (!point) {
            return null;
          }
          const x =
            padding.left +
            (data.length <= 1
              ? innerWidth / 2
              : (index / (data.length - 1)) * innerWidth);
          return (
            <text
              key={point.date}
              x={x}
              y={height - 8}
              textAnchor="middle"
              className="fill-muted text-[0.65rem]"
            >
              {point.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
