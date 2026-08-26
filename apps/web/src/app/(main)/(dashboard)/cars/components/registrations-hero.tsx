import { Tooltip } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { NumberValue } from "@heroui-pro/react";
import { slugify } from "@motormetrics/utils";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/app/(main)/(dashboard)/cars/components/format-month";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import { HeroCard } from "@web/components/shared/bento";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { sparkline } from "@web/components/shared/sparkline";
import Typography from "@web/components/typography";
import {
  getDimensionStats,
  getMonthlyRegistrationTotals,
} from "@web/queries/cars";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

/**
 * Deep enough to reach the oldest month the picker offers, so selecting an
 * early month still yields a full run-up rather than an empty series.
 */
const HISTORY_LIMIT = 360;

/** Months drawn in the hero sparkline. */
const SPARK_MONTHS = 12;

export async function RegistrationsHero({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const month = await resolveCarsMonth(searchParams);
  const [monthlyTotals, makeStats] = await Promise.all([
    getMonthlyRegistrationTotals(HISTORY_LIMIT),
    getDimensionStats("make", month),
  ]);

  const selectedIndex = monthlyTotals.findIndex((row) => row.month === month);
  if (selectedIndex < 0) {
    return null;
  }

  const history = monthlyTotals.slice(0, selectedIndex + 1);
  const current = history[selectedIndex];
  const previous = history.at(-2);
  const previousTotal = previous?.total ?? 0;
  const changeRatio =
    previousTotal > 0 ? (current.total - previousTotal) / previousTotal : 0;

  const year = month.slice(0, 4);
  const yearToDate = history
    .filter((row) => row.month.startsWith(year))
    .reduce((total, row) => total + row.total, 0);

  const series = history.slice(-SPARK_MONTHS).map((row) => row.total);
  const spark = sparkline(series, 380, 90);
  const leader = makeStats[0];

  return (
    <HeroCard>
      <span className="w-fit rounded-full bg-accent-foreground/20 px-4 py-2 font-bold text-sm">
        Registered · {formatMonthLabel(month)}
      </span>

      <div className="flex flex-wrap items-center gap-4">
        <span className="font-extrabold text-6xl tabular-nums tracking-[-0.03em]">
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={current.total}
          />
        </span>
        <DeltaChip ratio={changeRatio} tone="inverse" />
      </div>

      <Typography.Text className="font-semibold text-accent-foreground/85">
        cars registered vs{" "}
        {previous ? formatMonthName(previous.month) : "the previous month"} ·{" "}
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={yearToDate}
        />{" "}
        year to date
      </Typography.Text>

      {spark ? (
        <svg
          className="h-[90px] w-full overflow-visible"
          role="img"
          viewBox="0 0 380 90"
        >
          <title>{`Monthly registrations over the ${series.length} months to ${formatMonthLabel(month)}`}</title>
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

      {leader ? (
        <div className="flex items-center gap-4 rounded-field bg-foreground/70 px-6 py-5">
          <div className="flex min-w-0 flex-col gap-0.5">
            <Typography.TextLg className="font-bold text-accent-foreground">
              {leader.name} leads with{" "}
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={leader.count}
              />
            </Typography.TextLg>
            <Typography.Caption className="text-accent-foreground/70">
              {leader.share.toFixed(1)}% of registrations year to date
            </Typography.Caption>
          </div>
          <Tooltip delay={300}>
            <Link
              aria-label={`View registrations for ${leader.name}`}
              className={buttonVariants({
                className:
                  "ml-auto size-12 shrink-0 rounded-full bg-accent-foreground text-accent",
                isIconOnly: true,
                variant: "tertiary",
              })}
              href={`/cars/makes/${slugify(leader.name)}`}
            >
              <ArrowUpRight className="size-5" />
            </Link>
            <Tooltip.Content>{`View registrations for ${leader.name}`}</Tooltip.Content>
          </Tooltip>
        </div>
      ) : null}
    </HeroCard>
  );
}
