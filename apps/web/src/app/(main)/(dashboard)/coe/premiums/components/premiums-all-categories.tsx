import { Skeleton } from "@heroui/react";
import {
  biddingOrdinal,
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  changeRatio,
  formatExercise,
  formatMonth,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  type PremiumsCategoryRow,
  PremiumsCategoryTable,
} from "@web/app/(main)/(dashboard)/coe/premiums/components/categories-table";
import { allCategoriesCaption } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-shared";
import {
  loadPremiumsView,
  type PremiumsPageProps,
} from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-view";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { Suspense } from "react";

/** Every category's quota, bids and premium in the selected exercise. */
async function loadRows(searchParams: PremiumsPageProps["searchParams"]) {
  const view = await loadPremiumsView(searchParams);
  if (!view) {
    return null;
  }

  const { current, previous } = view;
  const currentRows = new Map(
    current.rows.map((row) => [row.vehicleClass, row]),
  );
  const previousRows = new Map(
    (previous?.rows ?? []).map((row) => [row.vehicleClass, row]),
  );
  const rows: PremiumsCategoryRow[] = COE_CATEGORIES.map((entry) => {
    const row = currentRows.get(entry);
    const previousRow = previousRows.get(entry);
    return {
      bidsReceived: row?.bidsReceived ?? 0,
      changeRatio:
        row && previousRow
          ? changeRatio(row.premium, previousRow.premium)
          : null,
      description: CATEGORY_DESCRIPTIONS[entry],
      key: toCategoryKey(entry),
      premium: row?.premium ?? 0,
      quota: row?.quota ?? 0,
    };
  });

  return { ...view, rows };
}

/**
 * Figure 2: every category in the selected exercise. Selecting a row selects
 * its category for the rest of the page.
 */
export function PremiumsAllCategories({ searchParams }: PremiumsPageProps) {
  return (
    <section className="flex scroll-mt-4 flex-col gap-4" id="prem-all">
      <SectionHead
        caption={
          <Suspense fallback=" ">
            <AllCategoriesCaption searchParams={searchParams} />
          </Suspense>
        }
        eyebrow="Figure 2 · All categories"
        title={
          <Suspense fallback="Latest exercise">
            <ExerciseName searchParams={searchParams} />
          </Suspense>
        }
      />
      <SectionErrorBoundary title="Category results unavailable">
        <Suspense fallback={<Skeleton className="h-72 w-full rounded-md" />}>
          <AllCategoriesTable searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
      <SourceNote>
        Source: LTA via DataMall · Quota premium at the close of the exercise.
        Change is against the previous exercise; colour does not show direction.
        Select a row to chart it.
      </SourceNote>
    </section>
  );
}

async function ExerciseName({ searchParams }: PremiumsPageProps) {
  const view = await loadPremiumsView(searchParams);
  return view ? formatExercise(view.current) : "Latest exercise";
}

async function AllCategoriesCaption({ searchParams }: PremiumsPageProps) {
  const data = await loadRows(searchParams);
  if (!data) {
    return null;
  }

  const { previous, rows } = data;
  return (
    allCategoriesCaption(
      rows,
      previous
        ? `${biddingOrdinal(previous.biddingNo)} exercise of ${formatMonth(previous.month)}`
        : null,
    ) ?? null
  );
}

async function AllCategoriesTable({ searchParams }: PremiumsPageProps) {
  const data = await loadRows(searchParams);
  return data ? (
    <PremiumsCategoryTable rows={data.rows} selected={data.categoryKey} />
  ) : null;
}
