import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { CategoryTabs } from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import {
  biddingOrdinal,
  CATEGORY_DESCRIPTIONS,
  formatMonth,
  formatPremiumChange,
  toCategory,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import type { CategoryKey } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { StatCell } from "@web/components/shared/overview";
import type { CategoryExercise } from "@web/queries/coe";

/**
 * The category tabs and latest premium, beside the previous exercise and the
 * year-to-date average, high and low.
 */
export function PremiumsHeadline({
  categoryKey,
  history,
  latest,
  year,
}: {
  categoryKey: CategoryKey;
  /** Every exercise up to and including the selected one, oldest first. */
  history: CategoryExercise[];
  /** The selected exercise, the last in `history`. */
  latest: CategoryExercise;
  year: number;
}) {
  const category = toCategory(categoryKey);
  const prior = history.at(-2) ?? null;
  const yearPremiums = history
    .filter(({ month }) => month.startsWith(`${year}-`))
    .map(({ premium }) => premium);
  const yearAverage = yearPremiums.length
    ? Math.round(
        yearPremiums.reduce((sum, premium) => sum + premium, 0) /
          yearPremiums.length,
      )
    : 0;
  const yearHigh = yearPremiums.length ? Math.max(...yearPremiums) : 0;
  const yearLow = yearPremiums.length ? Math.min(...yearPremiums) : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-14">
      <div className="flex min-w-0 flex-col gap-3">
        <CategoryTabs selected={categoryKey} />
        <Typography.Paragraph className="text-muted-strong">
          <span className="font-semibold text-accent-strong">{category}</span>
          {` · ${CATEGORY_DESCRIPTIONS[category]}`}
        </Typography.Paragraph>
        <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight md:text-6xl">
          <NumberValue
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={latest.premium}
          />
        </span>
        <Typography.Paragraph className="tabular-nums" color="muted">
          {formatPremiumChange(latest.premium, prior ?? undefined)}
        </Typography.Paragraph>
      </div>

      <div className="grid grid-cols-2 border-separator border-t">
        <StatCell
          label="Previous exercise"
          note={
            prior
              ? `${formatMonth(prior.month, "short")} · ${biddingOrdinal(prior.biddingNo)}`
              : "None earlier"
          }
          value={prior ? formatCurrency(prior.premium) : "—"}
        />
        <StatCell
          label={`${year} average`}
          note={`${yearPremiums.length} exercises`}
          value={formatCurrency(yearAverage)}
        />
        <StatCell
          label={`${year} high`}
          note="year to date"
          value={formatCurrency(yearHigh)}
        />
        <StatCell
          label={`${year} low`}
          note="year to date"
          value={formatCurrency(yearLow)}
        />
      </div>
    </div>
  );
}
