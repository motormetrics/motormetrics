import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { CategoryTabs } from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import {
  biddingOrdinal,
  CATEGORY_DESCRIPTIONS,
  changeRatio,
  formatPremiumChange,
  groupByExercise,
  nextExercise,
  toCategory,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { loadCoeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { CostTrendChip } from "@web/components/shared/cost-trend-chip";
import { getCoeResults, getPqpRates } from "@web/queries/coe";
import type { Pqp } from "@web/types";
import { formatMonthName } from "@web/utils/dates/format-month";
import type { SearchParams } from "nuqs/server";
import type { ReactNode } from "react";

/**
 * One cell of a ruled two-column stat grid: a small label, the figure and a
 * muted note. Odd cells sit flush left; even cells carry the vertical rule.
 */
export function StatCell({
  label,
  note,
  value,
}: {
  label: string;
  note: ReactNode;
  value: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-[3px] border-separator border-b py-3.5 pr-4 even:border-l even:pl-4">
      <Typography.Paragraph weight="semibold" color="muted" size="xs">
        {label}
      </Typography.Paragraph>
      <span className="font-semibold text-[22px] tabular-nums tracking-[-0.01em]">
        {value}
      </span>
      <Typography.Paragraph className="tabular-nums" color="muted" size="xs">
        {note}
      </Typography.Paragraph>
    </div>
  );
}

/**
 * The opening block of /coe: the category switch, the selected category's
 * latest premium with its change on the previous exercise, and a ruled grid
 * of that exercise's figures. Stacks into one column at 900px and below.
 */
export async function CoeHeadline({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [{ category: categoryKey }, results, pqpRates] = await Promise.all([
    loadCoeOverviewSearchParams(searchParams),
    getCoeResults(),
    getPqpRates(),
  ]);

  const exercises = groupByExercise(results);
  const latest = exercises.at(-1);
  const previous = exercises.at(-2);

  if (!latest) {
    return null;
  }

  const category = toCategory(categoryKey);
  const figures = latest.results[category];
  const premium = figures?.premium ?? 0;
  const previousPremium = previous?.results[category]?.premium;
  const bidsPerCoe = figures?.quota
    ? `${(figures.bidsReceived / figures.quota).toFixed(2)} bids per COE`
    : "—";

  // The `pqp` table only publishes A–D: an Open category COE cannot be
  // renewed, so Category E has no rate.
  const [pqpMonth, previousPqpMonth] = Object.keys(pqpRates).sort().reverse();
  const pqpKey = category as keyof Pqp.Rates;
  const pqpRate = pqpMonth ? pqpRates[pqpMonth]?.[pqpKey] : undefined;
  const previousPqpRate = previousPqpMonth
    ? pqpRates[previousPqpMonth]?.[pqpKey]
    : undefined;
  const pqpChange = changeRatio(pqpRate ?? 0, previousPqpRate);
  const upcoming = nextExercise(latest);
  const upcomingOrdinal = biddingOrdinal(upcoming.biddingNo);

  return (
    <div className="grid gap-5 min-[901px]:grid-cols-[1.15fr_1fr] min-[901px]:items-end min-[901px]:gap-14">
      <div className="flex min-w-0 flex-col gap-3">
        <CategoryTabs selected={categoryKey} />
        <Typography.Paragraph className="text-muted-strong">
          <span className="font-semibold text-accent-strong">{category}</span>
          {` · ${CATEGORY_DESCRIPTIONS[category]}`}
        </Typography.Paragraph>
        <span className="font-extrabold text-[46px] tabular-nums leading-[0.95] tracking-[-0.03em] min-[721px]:text-[60px]">
          <NumberValue
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={premium}
          />
        </span>
        <Typography.Paragraph className="tabular-nums" color="muted">
          {formatPremiumChange(
            premium,
            previous && previousPremium !== undefined
              ? { ...previous, premium: previousPremium }
              : undefined,
          )}
        </Typography.Paragraph>
      </div>

      <div className="grid grid-cols-2 border-separator border-t">
        <StatCell
          label="Quota"
          note="COEs available"
          value={
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={figures?.quota ?? 0}
            />
          }
        />
        <StatCell
          label="Bids received"
          note={bidsPerCoe}
          value={
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={figures?.bidsReceived ?? 0}
            />
          }
        />
        <StatCell
          label={pqpMonth ? `PQP, ${formatMonthName(pqpMonth)}` : "PQP"}
          note={
            pqpRate === undefined ? (
              `Not set for ${category}`
            ) : previousPqpMonth && pqpChange !== 0 ? (
              <>
                <CostTrendChip changeRatio={pqpChange} />
                {` vs ${formatMonthName(previousPqpMonth)}`}
              </>
            ) : (
              "Three-month moving average"
            )
          }
          value={
            pqpRate === undefined ? (
              "—"
            ) : (
              <NumberValue
                currency="SGD"
                locale="en-SG"
                maximumFractionDigits={0}
                style="currency"
                value={pqpRate}
              />
            )
          }
        />
        <StatCell
          label="Next exercise"
          note={`${upcomingOrdinal.charAt(0).toUpperCase()}${upcomingOrdinal.slice(1)} exercise · closes 16:00`}
          value={formatMonthName(upcoming.month)}
        />
      </div>
    </div>
  );
}
