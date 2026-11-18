import {
  CategoryCardsSelected,
  CategoryCardsView,
} from "@web/app/(main)/(dashboard)/coe/components/category-cards";
import {
  ClosingPremiumsSelected,
  ClosingPremiumsView,
} from "@web/app/(main)/(dashboard)/coe/components/closing-premiums-view";
import { loadCoeOverview } from "@web/app/(main)/(dashboard)/coe/components/overview-loader";
import {
  PremiumsByExerciseSelected,
  PremiumsByExerciseView,
} from "@web/app/(main)/(dashboard)/coe/components/premiums-by-exercise-view";
import { coeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { Suspense } from "react";

/**
 * The /coe bidding history, in the static shell: the fallback draws the
 * default category and range, and the client view swaps in those in the URL.
 */
export async function PremiumsByExercise() {
  const data = await loadCoeOverview();

  if (!data) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <PremiumsByExerciseView
          categoryKey={coeOverviewSearchParams.category.defaultValue}
          data={data}
          range={coeOverviewSearchParams.range.defaultValue}
        />
      }
    >
      <PremiumsByExerciseSelected data={data} />
    </Suspense>
  );
}

/** Every category's latest premium as selectable cards, in the static shell. */
export async function CategoryCards() {
  const data = await loadCoeOverview();

  if (!data) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <CategoryCardsView
          categoryKey={coeOverviewSearchParams.category.defaultValue}
          data={data}
          range={coeOverviewSearchParams.range.defaultValue}
        />
      }
    >
      <CategoryCardsSelected data={data} />
    </Suspense>
  );
}

/** The closing premiums table for the exercises shown, in the static shell. */
export async function ClosingPremiums() {
  const data = await loadCoeOverview();

  if (!data) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <ClosingPremiumsView
          data={data}
          range={coeOverviewSearchParams.range.defaultValue}
        />
      }
    >
      <ClosingPremiumsSelected data={data} />
    </Suspense>
  );
}
