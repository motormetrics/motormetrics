import { Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { CategoryTabs } from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import {
  biddingOrdinal,
  CATEGORY_DESCRIPTIONS,
  formatExercise,
  formatMonth,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  HeadAnswer,
  KeyNumberList,
} from "@web/app/(main)/(dashboard)/coe/premiums/components/head-answer";
import {
  exerciseStamp,
  premiumsLead,
} from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-shared";
import {
  loadPremiumsView,
  type PremiumsPageProps,
} from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-view";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/coe/premiums/search-params";

/** The window the range hero places the latest premium in: a year of exercises. */
const RANGE_EXERCISES = 24;

/** " · Second bidding, September 2026", the eyebrow's suffix. */
export async function ExerciseEyebrow({ searchParams }: PremiumsPageProps) {
  const view = await loadPremiumsView(searchParams);
  return view ? ` · ${formatExercise(view.current)}` : null;
}

/** The A–E switch in the head, on the selection in the URL. */
export async function PremiumsCategoryTabs({
  searchParams,
}: PremiumsPageProps) {
  const { category } = await loadSearchParams(searchParams);
  return <CategoryTabs selected={category} />;
}

/** The selected category's premium, its change and where it sits in a year. */
export async function PremiumsAnswer({ searchParams }: PremiumsPageProps) {
  const view = await loadPremiumsView(searchParams);
  if (!view) {
    return null;
  }

  const { category, history, latest } = view;
  const prior = history.at(-2);
  const premiums = history
    .slice(-RANGE_EXERCISES)
    .map(({ premium }) => premium);

  return (
    <HeadAnswer
      context={
        prior
          ? `Against the ${biddingOrdinal(prior.biddingNo)} bidding of ${formatMonth(prior.month)} at ${formatCurrency(prior.premium)}.`
          : "The first exercise on record."
      }
      count={premiums.length}
      high={Math.max(...premiums)}
      label={
        <>
          <span className="font-semibold text-foreground">{category}</span>
          {` · ${CATEGORY_DESCRIPTIONS[category]}`}
        </>
      }
      low={Math.min(...premiums)}
      previous={prior?.premium}
      unit="exercise"
      value={latest.premium}
    />
  );
}

/** The bids, quota and success rate behind the selected premium. */
export async function PremiumsLead({ searchParams }: PremiumsPageProps) {
  const view = await loadPremiumsView(searchParams);
  if (!view) {
    return null;
  }

  return (
    <Typography.Paragraph className="max-w-prose text-lg tabular-nums">
      {premiumsLead(view.latest, view.category)}
    </Typography.Paragraph>
  );
}

/** The previous exercise and the year to date's average, high and low. */
export async function PremiumsKeyNumbers({ searchParams }: PremiumsPageProps) {
  const view = await loadPremiumsView(searchParams);
  if (!view) {
    return null;
  }

  const { history, year } = view;
  const prior = history.at(-2);
  const yearPremiums = history
    .filter(({ month }) => month.startsWith(`${year}-`))
    .map(({ premium }) => premium);
  const average = yearPremiums.length
    ? yearPremiums.reduce((sum, premium) => sum + premium, 0) /
      yearPremiums.length
    : 0;

  const keyNumbers = [
    {
      label: "Previous exercise",
      note: prior ? exerciseStamp(prior) : "None earlier",
      value: prior ? formatCurrency(prior.premium) : "—",
    },
    {
      label: `${year} average`,
      note: `${yearPremiums.length} exercises`,
      value: formatCurrency(Math.round(average)),
    },
    {
      label: `${year} high`,
      note: "year to date",
      value: formatCurrency(
        yearPremiums.length ? Math.max(...yearPremiums) : 0,
      ),
    },
    {
      label: `${year} low`,
      note: "year to date",
      value: formatCurrency(
        yearPremiums.length ? Math.min(...yearPremiums) : 0,
      ),
    },
  ];

  return <KeyNumberList items={keyNumbers} />;
}
