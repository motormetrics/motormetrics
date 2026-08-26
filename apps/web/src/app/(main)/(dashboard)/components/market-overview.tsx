import { NumberValue } from "@heroui-pro/react";
import Typography from "@web/components/typography";
import { getCategorySummaryByYear } from "@web/queries/cars";

const RADIUS = 74;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SEGMENT_GAP = 16;

export async function MarketOverview() {
  const summary = await getCategorySummaryByYear();
  const others = Math.max(summary.total - summary.electric - summary.hybrid, 0);

  const slices = [
    { label: "Electric", value: summary.electric, color: "var(--chart-1)" },
    { label: "Hybrid", value: summary.hybrid, color: "var(--chart-2)" },
    { label: "Other", value: others, color: "var(--chart-5)" },
  ];

  const total = summary.total || 1;
  let offset = 0;
  const segments = slices.map((slice) => {
    const full = (slice.value / total) * CIRCUMFERENCE;
    const dash = Math.max(2, full - SEGMENT_GAP);
    const segment = {
      ...slice,
      dashArray: `${dash.toFixed(2)} ${(CIRCUMFERENCE - dash).toFixed(2)}`,
      dashOffset: (-(offset + SEGMENT_GAP / 2)).toFixed(2),
    };
    offset += full;
    return segment;
  });

  return (
    <div className="flex flex-col gap-6 rounded-4xl bg-surface p-8 shadow-surface">
      <div className="flex flex-col gap-1">
        <Typography.TextSm className="font-semibold text-muted">
          Market overview
        </Typography.TextSm>
        <Typography.H3 className="font-bold tracking-[-0.02em]">
          By powertrain
        </Typography.H3>
      </div>

      <div className="relative mx-auto size-[172px]">
        <svg className="block size-[172px]" role="img" viewBox="0 0 190 190">
          <title>{`Registrations by powertrain, ${summary.year} year to date`}</title>
          <g transform="rotate(-90 95 95)">
            {segments.map((segment) => (
              <circle
                cx={95}
                cy={95}
                fill="none"
                key={segment.label}
                r={RADIUS}
                stroke={segment.color}
                strokeDasharray={segment.dashArray}
                strokeDashoffset={segment.dashOffset}
                strokeLinecap="round"
                strokeWidth={24}
              />
            ))}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="font-extrabold text-3xl tabular-nums tracking-[-0.02em]">
            <NumberValue
              maximumFractionDigits={1}
              notation="compact"
              value={summary.total}
            />
          </span>
          <Typography.Caption className="font-semibold text-muted">
            registrations
          </Typography.Caption>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {slices.map((slice) => (
          <div className="flex items-center gap-3" key={slice.label}>
            <span
              aria-hidden
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <Typography.TextSm className="font-semibold">
              {slice.label}
            </Typography.TextSm>
            <span className="ml-auto font-bold text-sm tabular-nums">
              {((slice.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <Typography.Caption className="text-muted">
        {summary.year} year to date
      </Typography.Caption>
    </div>
  );
}
