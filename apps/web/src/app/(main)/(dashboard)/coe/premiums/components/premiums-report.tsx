import { Typography } from "@heroui/react";
import { toCategory } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { PremiumsAllCategories } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-all-categories";
import { PremiumsHeadline } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-headline";
import { PremiumsHistory } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-history";
import { PremiumsRange } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-range";
import { PremiumsTrend } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-trend";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/coe/premiums/search-params";
import {
  Hairline,
  SectionHead,
  SectionLink,
} from "@web/components/shared/overview";
import { getCategoryExercises, getExercisePair } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";

export async function PremiumsReport({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const {
    category: categoryKey,
    month: parsedMonth,
    range,
  } = await loadSearchParams(searchParams);
  const category = toCategory(categoryKey);

  const [{ current, previous }, allExercises] = await Promise.all([
    getExercisePair(parsedMonth ?? undefined),
    getCategoryExercises(category),
  ]);

  if (!current) {
    return null;
  }

  // The selected exercise can sit mid-history when a month is picked, so the
  // series is truncated to it before anything is derived.
  const currentIndex = allExercises.findIndex(
    ({ biddingNo, month }) =>
      month === current.month && biddingNo === current.biddingNo,
  );
  const history =
    currentIndex >= 0 ? allExercises.slice(0, currentIndex + 1) : allExercises;
  const latest = history.at(-1);

  if (!latest) {
    return null;
  }

  const year = Number(latest.month.slice(0, 4));

  return (
    <>
      <PremiumsHeadline
        categoryKey={categoryKey}
        history={history}
        latest={latest}
        year={year}
      />

      <PremiumsTrend category={category} history={history} range={range} />

      <Hairline />

      <PremiumsAllCategories
        categoryKey={categoryKey}
        current={current}
        previous={previous}
      />

      <Hairline />

      <PremiumsHistory
        category={category}
        current={current}
        history={history}
      />

      <Hairline />

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <PremiumsRange
          allExercises={allExercises}
          category={category}
          history={history}
          year={year}
        />

        <section className="flex min-w-0 flex-col gap-4 lg:col-span-5">
          <SectionHead
            eyebrow="Reading the numbers"
            title="How premiums are set"
          />
          <Typography.Paragraph className="text-muted-strong">
            A premium is the price of the last successful bid in an exercise, so
            it is set by demand rather than announced in advance.
          </Typography.Paragraph>
          <Typography.Paragraph className="text-muted-strong">
            Renewing an existing COE uses the PQP instead: the three-month
            moving average of premiums in that category.
          </Typography.Paragraph>
          <div className="flex flex-col items-start gap-2">
            <SectionLink className="ml-0" href="/coe/pqp">
              PQP rates
            </SectionLink>
            <SectionLink className="ml-0" href="/coe/results">
              Results by exercise
            </SectionLink>
          </div>
        </section>
      </div>
    </>
  );
}
