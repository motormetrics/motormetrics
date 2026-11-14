import { Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  CATEGORY_DESCRIPTIONS,
  formatExercise,
  formatMonth,
  toCategory,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { pqpLead } from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-captions";
import {
  loadPqpData,
  loadPqpView,
  type PQPPageProps,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-view";
import {
  HeadAnswer,
  type KeyNumber,
  KeyNumberList,
} from "@web/app/(main)/(dashboard)/coe/premiums/components/head-answer";
import { formatMonthName } from "@web/utils/dates/format-month";

/** " · October 2026", the eyebrow's suffix: the month the rates are for. */
export async function LatestMonthEyebrow() {
  const { latestMonth } = await loadPqpData();
  return latestMonth ? ` · ${formatMonth(latestMonth)}` : null;
}

/** The source line under the lead, naming the published month. */
export async function PQPSource() {
  const { latestMonth } = await loadPqpData();
  return (
    <Typography.Paragraph color="muted" size="sm">
      Source: LTA via DataMall.
      {latestMonth
        ? ` Prevailing quota premium for ${formatMonth(latestMonth)}.`
        : null}
    </Typography.Paragraph>
  );
}

/** The renewal cost for the selection, its change and its 12-month range. */
export async function PQPAnswer({ searchParams }: PQPPageProps) {
  const { category, rates, term } = await loadPqpView(searchParams);
  const latest = rates.at(-1);
  if (!latest) {
    return null;
  }

  const previous = rates.at(-2);
  const values = rates.map(({ rate }) => rate);

  return (
    <HeadAnswer
      context={`${previous ? `Against ${formatMonthName(previous.month)} at ${formatCurrency(previous.rate)}. ` : ""}Three-month average of premiums, published for ${formatMonth(latest.month)}.`}
      count={rates.length}
      high={Math.max(...values)}
      label={
        <>
          <span className="font-semibold text-foreground">
            Category {category}
          </span>
          {` · ${CATEGORY_DESCRIPTIONS[toCategory(category)]} · ${term}-year renewal`}
        </>
      }
      low={Math.min(...values)}
      previous={previous?.rate}
      unit="month"
      value={latest.rate}
    />
  );
}

export async function PQPLead({ searchParams }: PQPPageProps) {
  const { category, rates, term } = await loadPqpView(searchParams);
  const lead = pqpLead(`Category ${category}`, term, rates);

  return lead ? (
    <Typography.Paragraph className="max-w-prose text-lg tabular-nums">
      {lead}
    </Typography.Paragraph>
  ) : null;
}

/** The figures a renewal is weighed against, at the selected term. */
export async function PQPKeyNumbers({ searchParams }: PQPPageProps) {
  const { category, factor, latestExercise, latestPremium, rates, term } =
    await loadPqpView(searchParams);
  const latest = rates.at(-1);
  if (!latest) {
    return null;
  }

  const previous = rates.at(-2);
  const threeMonthsAgo = rates.at(-4);
  const fullRate = latest.rate / factor;
  const items: KeyNumber[] = [
    {
      label: "Previous month",
      note: previous
        ? `${formatMonth(previous.month)}, published rate`
        : "Not published",
      value: previous ? formatCurrency(previous.rate) : "—",
    },
    {
      label: "Latest premium",
      note: latestExercise ? formatExercise(latestExercise) : "—",
      value: formatCurrency(latestPremium(category)),
    },
    term === "10"
      ? {
          label: "5-year renewal",
          note: "Half the PQP",
          value: formatCurrency(fullRate / 2),
        }
      : {
          label: "10-year renewal",
          note: "The full PQP",
          value: formatCurrency(fullRate),
        },
    {
      label: "Three months ago",
      note: threeMonthsAgo
        ? `${formatMonth(threeMonthsAgo.month)}, published rate`
        : "Not published",
      value: threeMonthsAgo ? formatCurrency(threeMonthsAgo.rate) : "—",
    },
  ];

  return <KeyNumberList items={items} />;
}
