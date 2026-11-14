import { Typography } from "@heroui/react";
import type { CategoryRow } from "@web/app/(main)/(dashboard)/coe/components/all-categories-sort";
import {
  AllCategoriesTable,
  AllCategoriesTableSelected,
} from "@web/app/(main)/(dashboard)/coe/components/all-categories-table";
import {
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  changeRatio,
  formatExerciseTick,
  groupByExercise,
  summariseExercise,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  demandCaption,
  pqpFor,
} from "@web/app/(main)/(dashboard)/coe/components/overview-figures";
import { loadCoeOverview } from "@web/app/(main)/(dashboard)/coe/components/overview-loader";
import {
  QuotaAllocationSelected,
  QuotaAllocationView,
} from "@web/app/(main)/(dashboard)/coe/components/quota-allocation-view";
import { coeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { getCoeResults } from "@web/queries/coe";
import { Suspense } from "react";

const DEFAULT_CATEGORY = coeOverviewSearchParams.category.defaultValue;

/**
 * Figure 2 on /coe: every category's latest result in a table beside the bids
 * against quota. Both read cached data and sit in the static shell; the
 * fallbacks select the default category, and the client views the category
 * in the URL.
 */
export async function AllCategories() {
  const [data, results] = await Promise.all([
    loadCoeOverview(),
    getCoeResults(),
  ]);

  if (!data) {
    return null;
  }

  const { history, latest, previous } = data;
  const rows: CategoryRow[] = COE_CATEGORIES.map((category) => {
    const figures = latest.results[category];
    const premium = figures?.premium ?? 0;
    return {
      bidsReceived: figures?.bidsReceived ?? 0,
      category,
      categoryKey: toCategoryKey(category),
      changeRatio: changeRatio(
        premium,
        previous?.results[category]?.premium ?? 0,
      ),
      description: CATEGORY_DESCRIPTIONS[category],
      pqp: pqpFor(data, category)?.rate,
      premium,
      quota: figures?.quota ?? 0,
      series: history.flatMap((exercise) => {
        const value = exercise.results[category]?.premium;
        return value === undefined
          ? []
          : [{ label: formatExerciseTick(exercise), value }];
      }),
    };
  });
  const summary = summariseExercise(groupByExercise(results));

  return (
    <div className="flex flex-col gap-5">
      <SectionHead
        caption={demandCaption(latest)}
        eyebrow="Figure 2 · This exercise"
        link={{ href: "/coe/results", label: "All COE results" }}
        title="All categories, and bids against quota"
      />
      <div className="grid items-start gap-x-16 gap-y-9 2xl:grid-cols-2">
        <Suspense
          fallback={
            <AllCategoriesTable rows={rows} selected={DEFAULT_CATEGORY} />
          }
        >
          <AllCategoriesTableSelected rows={rows} />
        </Suspense>
        <Suspense
          fallback={
            <QuotaAllocationView
              categoryKey={DEFAULT_CATEGORY}
              latest={latest}
            />
          }
        >
          <QuotaAllocationSelected latest={latest} />
        </Suspense>
      </div>
      {summary ? (
        <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
          {summary}
        </Typography.Paragraph>
      ) : null}
      <SourceNote>
        Source: LTA via DataMall · Change is against the previous exercise;
        colour does not show direction. Bids and quota share one scale.
      </SourceNote>
    </div>
  );
}
