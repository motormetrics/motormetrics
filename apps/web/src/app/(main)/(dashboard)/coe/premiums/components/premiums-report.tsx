import { toCategory } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { PremiumsHistory } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-history";
import { PremiumsRange } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-range";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/coe/premiums/search-params";
import { Hairline } from "@web/components/shared/overview";
import { getCategoryExercises, getExercisePair } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";

export async function PremiumsReport({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category: categoryKey, month: parsedMonth } =
    await loadSearchParams(searchParams);
  const category = toCategory(categoryKey);

  const [{ current }, allExercises] = await Promise.all([
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
      <PremiumsHistory
        category={category}
        current={current}
        history={history}
      />

      <Hairline />

      <PremiumsRange
        allExercises={allExercises}
        category={category}
        history={history}
        year={year}
      />
    </>
  );
}
