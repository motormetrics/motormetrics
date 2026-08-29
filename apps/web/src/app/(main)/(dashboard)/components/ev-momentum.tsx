import { Tooltip } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { NumberValue } from "@heroui-pro/react";
import { InkPanel } from "@web/components/shared/bento";
import { sparkline } from "@web/components/shared/sparkline";
import Typography from "@web/components/typography";
import {
  getEvLatestSummary,
  getEvMonthlyTrend,
  getEvTopMakes,
} from "@web/queries/cars";
import { ArrowUpRight, Zap } from "lucide-react";
import Link from "next/link";

export async function EvMomentum() {
  const [summary, trend, topMakes] = await Promise.all([
    getEvLatestSummary(),
    getEvMonthlyTrend(),
    getEvTopMakes(3),
  ]);

  if (!summary) {
    return null;
  }

  const series = trend.slice(-8).map((point) => point.BEV + point.PHEV);
  const spark = sparkline(series, 340, 84);
  const evTotal = summary.totalEv || 1;

  const [year, month] = summary.month.split("-");
  const displayMonth = new Date(Number(year), Number(month) - 1).toLocaleString(
    "en-SG",
    { month: "long", year: "numeric" },
  );

  return (
    <InkPanel>
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent-on-dark/20 text-accent-on-dark">
          <Zap className="size-5" />
        </span>
        <Typography.TextSm className="text-accent-foreground/85">
          Electric momentum
        </Typography.TextSm>
        <Tooltip delay={300}>
          <Link
            aria-label="View electric vehicle data"
            className={buttonVariants({
              className: "ml-auto size-10 rounded-full text-accent-foreground",
              isIconOnly: true,
              variant: "tertiary",
            })}
            href="/cars/electric"
          >
            <ArrowUpRight className="size-5" />
          </Link>
          <Tooltip.Content>View electric vehicle data</Tooltip.Content>
        </Tooltip>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="font-extrabold text-5xl text-accent-on-dark tabular-nums tracking-tight">
          {summary.evSharePercent.toFixed(1)}%
        </span>
        <span className="rounded-full bg-accent-on-dark/20 px-4 py-2 font-bold text-accent-on-dark text-sm tabular-nums">
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={summary.totalEv}
          />
        </span>
      </div>

      <Typography.TextSm className="text-accent-foreground/60">
        Electrified share (BEV, PHEV, hybrid) · {displayMonth}
      </Typography.TextSm>

      {spark ? (
        <svg
          className="h-[84px] w-full overflow-visible"
          role="img"
          viewBox="0 0 340 84"
        >
          <title>{`Electric registrations over the last ${series.length} months`}</title>
          <path d={spark.area} fill="var(--accent-on-dark)" opacity={0.14} />
          <path
            d={spark.line}
            fill="none"
            stroke="var(--accent-on-dark)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
          />
          <circle
            cx={spark.lastX}
            cy={spark.lastY}
            fill="var(--foreground)"
            r={6}
            stroke="var(--accent-on-dark)"
            strokeWidth={3}
          />
        </svg>
      ) : null}

      <div className="flex flex-col gap-3">
        {topMakes.map((make, index) => (
          <div className="flex items-center gap-3" key={make.make}>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-foreground/10 font-extrabold text-accent-foreground text-xs">
              {index + 1}
            </span>
            <span className="font-bold text-accent-foreground text-sm">
              {make.make}
            </span>
            <span className="ml-auto font-bold text-accent-foreground/85 text-sm tabular-nums">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={make.count}
              />
            </span>
            <span className="w-12 text-right font-semibold text-accent-foreground/50 text-xs tabular-nums">
              {((make.count / evTotal) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </InkPanel>
  );
}
