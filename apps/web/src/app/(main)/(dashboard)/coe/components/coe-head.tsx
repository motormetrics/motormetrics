import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  biddingOrdinal,
  formatExercise,
  formatMonth,
  groupByExercise,
  nextExercise,
  summariseByYear,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { pqpFor } from "@web/app/(main)/(dashboard)/coe/components/overview-figures";
import { loadCoeOverview } from "@web/app/(main)/(dashboard)/coe/components/overview-loader";
import { RailBlock } from "@web/app/(main)/(dashboard)/coe/components/rail-block";
import { KeyNumberItem } from "@web/components/shared/key-numbers";
import { SourceNote } from "@web/components/shared/overview";
import { getCoeResults } from "@web/queries/coe";
import type { COECategory } from "@web/types";
import { formatMonthLabel } from "@web/utils/dates/format-month";

/** The car categories the sidebar's key figures quote. */
const CAR_CATEGORIES: COECategory[] = ["Category A", "Category B"];

/** "First bidding, November 2026", under the title and beside section heads. */
export async function CoeExerciseName() {
  const data = await loadCoeOverview();

  return data ? formatExercise(data.latest) : null;
}

/** The source and the next exercise, under the category cards. */
export async function CoeSource() {
  const data = await loadCoeOverview();
  const next = data ? nextExercise(data.latest) : undefined;

  return (
    <SourceNote>
      Source: LTA via DataMall.
      {next
        ? ` Next exercise: ${biddingOrdinal(next.biddingNo)} bidding, ${formatMonth(next.month)}, closes 16:00.`
        : null}{" "}
      The bar under each premium runs from the low to the high of the exercises
      shown.
    </SourceNote>
  );
}

/**
 * The sidebar's PQP block: what renewing a Category A or B COE costs this
 * month, for ten years and for five. LTA charges half the PQP, rounded up,
 * for a 5-year renewal.
 */
export async function CoeRenewalKeys() {
  const data = await loadCoeOverview();

  if (!data?.pqp) {
    return null;
  }

  return (
    <RailBlock
      link={{ href: "/coe/pqp", label: "PQP rates" }}
      sub={`PQP, ${formatMonthLabel(data.pqp.month)}`}
      title="Renewing a COE"
    >
      {CAR_CATEGORIES.flatMap((category) => {
        const pqp = pqpFor(data, category);
        return pqp
          ? [
              <KeyNumberItem
                key={category}
                label={`${category}, 10-year`}
                note={`5-year: ${formatCurrency(Math.ceil(pqp.rate / 2))}`}
                value={formatCurrency(pqp.rate)}
              />,
            ]
          : [];
      })}
    </RailBlock>
  );
}

/**
 * The sidebar's yearly block: the mean closing premium of this year's
 * exercises so far, against last year's mean.
 */
export async function CoeYearAverageKeys() {
  const [thisYear, lastYear] = summariseByYear(
    groupByExercise(await getCoeResults()),
  );

  if (!thisYear) {
    return null;
  }

  return (
    <RailBlock
      link={{ href: "/coe/results", label: "Premium history" }}
      sub={`${thisYear.year} to date`}
      title="Average premium"
    >
      {CAR_CATEGORIES.flatMap((category) => {
        const average = thisYear.categories[category]?.average;
        if (average === undefined) {
          return [];
        }
        const previous = lastYear?.categories[category]?.average;
        const difference =
          previous === undefined ? undefined : average - previous;

        return [
          <KeyNumberItem
            key={category}
            label={category}
            note={
              difference === undefined || !lastYear
                ? undefined
                : difference === 0
                  ? `unchanged on ${lastYear.year}`
                  : `${difference > 0 ? "up" : "down"} ${formatCurrency(Math.abs(difference))} on ${lastYear.year}`
            }
            value={formatCurrency(average)}
          />,
        ];
      })}
    </RailBlock>
  );
}
