import type { ChartDatum } from "@/domains/admin/chart-data";

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    "M",
    centerX,
    centerY,
    "L",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "Z",
  ].join(" ");
}

type DonutChartProps = {
  data: ChartDatum[];
  centerLabel: string;
  centerValue: number;
};

export function DonutChart({ data, centerLabel, centerValue }: DonutChartProps) {
  const active = data.filter((item) => item.count > 0);
  const total = active.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-md border border-dashed border-line bg-brand-50/40 text-small text-muted">
        No complaint data yet.
      </div>
    );
  }

  const size = 220;
  const center = size / 2;
  const radius = 88;
  let cursor = 0;

  const segments = active.map((item) => {
    const sweep = (item.count / total) * 360;
    const start = cursor;
    const end = cursor + sweep;
    cursor = end;
    return {
      ...item,
      path: describeArc(center, center, radius, start, end),
    };
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-56 w-56 shrink-0"
        role="img"
        aria-label={`Complaint status distribution, ${total} total`}
      >
        {segments.map((segment) => (
          <path
            key={segment.key}
            d={segment.path}
            fill={segment.color}
            stroke="#ffffff"
            strokeWidth={2}
          />
        ))}
        <circle cx={center} cy={center} r={52} fill="#ffffff" />
        <text
          x={center}
          y={center - 4}
          textAnchor="middle"
          className="fill-navy text-[1.35rem] font-bold"
        >
          {centerValue}
        </text>
        <text
          x={center}
          y={center + 16}
          textAnchor="middle"
          className="fill-muted text-[0.7rem]"
        >
          {centerLabel}
        </text>
      </svg>

      <ul className="flex w-full flex-1 flex-col gap-2">
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
