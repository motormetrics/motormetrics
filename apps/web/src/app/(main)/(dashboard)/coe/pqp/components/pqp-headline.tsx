import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  CATEGORY_DESCRIPTIONS,
  formatExercise,
  formatMonth,
  toCategory,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  CategoryTabs,
  TermTabs,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-filters";
import {
  PQP_CATEGORY_KEYS,
  type PQPCategoryKey,
  type PQPTerm,
} from "@web/app/(main)/(dashboard)/coe/pqp/search-params";
import { SourceNote, StatCell } from "@web/components/shared/overview";
import { Text } from "@web/components/shared/text";
import { formatMonthName } from "@web/utils/dates/format-month";

/** A rate in one published month. */
export interface PQPMonthRate {
  month: string;
  rate: number;
}

/** "+0.4%", with a true minus for a fall and no colour. */
const formatPercent = (ratio: number): string =>
  `${ratio < 0 ? "−" : "+"}${Math.abs(ratio * 100).toFixed(1)}%`;

/** "+$507", with a true minus for a fall. */
const formatSignedCurrency = (amount: number): string =>
  `${amount < 0 ? "−" : "+"}${formatCurrency(Math.abs(amount))}`;

/**
 * The opening block of /coe/pqp: the category and term switches, the renewal
 * cost for that pair with its change on the previous month, and a ruled grid
 * of the figures a renewal is weighed against. Stacks into one column below lg.
 *
 * Every money figure is scaled by the term: a ten-year renewal costs the full
 * PQP, a five-year renewal half of it.
 */
export function PQPHeadline({
  category,
  latestExercise,
  latestPremium,
  rates,
  term,
}: {
  category: PQPCategoryKey;
  /** The exercise `latestPremium` closed at. */
  latestExercise: { biddingNo: number; month: string } | undefined;
  latestPremium: number;
  /** The selected category's published rates, oldest first. */
  rates: PQPMonthRate[];
  term: PQPTerm;
}) {
  const latest = rates.at(-1);
  if (!latest) {
    return null;
  }

  const previous = rates.at(-2);
  const threeMonthsAgo = rates.at(-4);
  const factor = term === "5" ? 0.5 : 1;
  const otherTerm = term === "5" ? "10" : "5";
  const current = latest.rate * factor;
  const prior = previous ? previous.rate * factor : undefined;

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-14">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap gap-2.5 max-md:flex-col">
          <CategoryTabs categories={PQP_CATEGORY_KEYS} />
          <TermTabs />
        </div>
        <Text.Paragraph tone="strong">
          <span className="font-semibold text-accent-strong">
            Category {category}
          </span>
          {` · ${CATEGORY_DESCRIPTIONS[toCategory(category)]}`}
        </Text.Paragraph>
        <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight md:text-6xl">
          <NumberValue
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={current}
          />
        </span>
        {prior && previous ? (
          <Typography.Paragraph className="tabular-nums" color="muted">
            <span className="font-semibold text-foreground">
              {formatPercent((current - prior) / prior)}
            </span>{" "}
            ({formatSignedCurrency(current - prior)}) vs{" "}
            {formatMonthName(previous.month)} at {formatCurrency(prior)}
          </Typography.Paragraph>
        ) : null}
        <SourceNote>
          {term}-year renewal · three-month average of premiums, published for{" "}
          {formatMonth(latest.month)}
        </SourceNote>
      </div>

      <div className="grid grid-cols-2 border-separator border-t">
        <StatCell
          label="Previous month"
          note={
            previous
              ? `${formatMonth(previous.month)}, published rate`
              : "Not published"
          }
          value={prior === undefined ? "—" : formatCurrency(prior)}
        />
        <StatCell
          label="Latest premium"
          note={latestExercise ? formatExercise(latestExercise) : "—"}
          value={formatCurrency(latestPremium)}
        />
        <StatCell
          label={`${otherTerm}-year renewal`}
          note={otherTerm === "10" ? "The full PQP" : "Half the PQP"}
          value={formatCurrency(latest.rate * (otherTerm === "5" ? 0.5 : 1))}
        />
        <StatCell
          label="Three months ago"
          note={
            threeMonthsAgo
              ? `${formatMonth(threeMonthsAgo.month)}, published rate`
              : "Not published"
          }
          value={
            threeMonthsAgo ? formatCurrency(threeMonthsAgo.rate * factor) : "—"
          }
        />
      </div>
    </div>
  );
}
