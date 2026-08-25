import { Link, Tooltip } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { NumberValue } from "@heroui-pro/react";
import Typography from "@web/components/typography";
import {
  getMonthlyRegistrationTotals,
  getYearlyRegistrations,
} from "@web/queries/cars";
import { ArrowUpRight } from "lucide-react";

/** Sparkline geometry for a series, normalised into a `width` x `height` box. */
function sparkline(values: number[], width: number, height: number, pad = 8) {
  if (values.length < 2) {
    return null;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => [
    (index / (values.length - 1)) * (width - pad * 2) + pad,
    height - pad - ((value - min) / span) * (height - pad * 2),
  ]);

  const line = points
    .map(
      ([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`,
    )
    .join(" ");
  const [lastX, lastY] = points.at(-1) ?? [0, 0];

  return {
    line,
    area: `${line} L${width - pad} ${height} L${pad} ${height} Z`,
    lastX: lastX.toFixed(1),
    lastY: lastY.toFixed(1),
  };
}

const formatMonth = (month: string, style: "long" | "short" = "long") => {
  const [year, monthPart] = month.split("-");
  return new Date(Number(year), Number(monthPart) - 1).toLocaleString("en-SG", {
    month: style,
    year: "numeric",
  });
};

export async function SummaryCard() {
  const [monthly, yearlyData] = await Promise.all([
    getMonthlyRegistrationTotals(12),
    getYearlyRegistrations(),
  ]);

  const current = monthly.at(-1);
  const previous = monthly.at(-2);

  if (!current) {
    return null;
  }

  const previousTotal = previous?.total ?? 0;
  // Month-over-month, not year-over-year: comparing a part-complete year against
  // a full one produced a headline that read as a ~75% collapse.
  const changeRatio =
    previousTotal > 0 ? (current.total - previousTotal) / previousTotal : 0;

  const yearToDate = yearlyData.at(-1);
  const spark = sparkline(
    monthly.map((item) => item.total),
    380,
    90,
  );

  return (
    <div
      className="flex flex-col gap-4 rounded-[var(--radius-card)] p-8 text-[var(--accent-foreground)] shadow-surface"
      style={{ background: "var(--accent-gradient)" }}
    >
      <span className="w-fit rounded-full bg-[var(--accent-foreground)]/20 px-4 py-2 font-semibold text-sm">
        New registrations · {formatMonth(current.month)}
      </span>

      <div className="flex flex-wrap items-center gap-4">
        <span className="font-extrabold text-6xl tabular-nums tracking-[-0.03em]">
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={current.total}
          />
        </span>
        <span className="flex items-center gap-2 rounded-full bg-[var(--accent-deep)]/85 px-4 py-2 font-bold text-sm">
          <span
            aria-hidden
            className="size-2 rounded-full bg-[var(--accent-foreground)]"
          />
          <NumberValue
            maximumFractionDigits={1}
            signDisplay="exceptZero"
            style="percent"
            value={changeRatio}
          />
        </span>
      </div>

      <Typography.TextSm className="font-semibold text-[var(--accent-foreground)]/85">
        cars registered vs{" "}
        {previous ? formatMonth(previous.month, "short") : "previous month"}
      </Typography.TextSm>

      {spark ? (
        <svg
          className="h-[90px] w-full overflow-visible"
          role="img"
          viewBox="0 0 380 90"
        >
          <title>{`Monthly registrations over the last ${monthly.length} months`}</title>
          <path d={spark.area} fill="currentColor" opacity={0.16} />
          <path
            d={spark.line}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3.5}
          />
          <circle
            cx={spark.lastX}
            cy={spark.lastY}
            fill="var(--accent)"
            r={6}
            stroke="currentColor"
            strokeWidth={3.5}
          />
        </svg>
      ) : null}

      <div className="flex items-center gap-4 rounded-[var(--radius)] bg-[var(--ink-surface)]/45 px-6 py-5">
        <div className="flex flex-col gap-1">
          <Typography.TextSm className="font-bold text-[var(--accent-foreground)] text-lg">
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={yearToDate?.total ?? 0}
            />{" "}
            year to date
          </Typography.TextSm>
          <Typography.Caption className="text-[var(--accent-foreground)]/70">
            cars registered in {yearToDate?.year ?? "—"}
          </Typography.Caption>
        </div>
        <Tooltip delay={300}>
          <Link
            aria-label="View car registration overview"
            className={buttonVariants({
              className:
                "ml-auto size-12 shrink-0 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)]",
              isIconOnly: true,
              variant: "tertiary",
            })}
            href="/cars"
          >
            <ArrowUpRight className="size-5" />
          </Link>
          <Tooltip.Content>View car registration overview</Tooltip.Content>
        </Tooltip>
      </div>
    </div>
  );
}
