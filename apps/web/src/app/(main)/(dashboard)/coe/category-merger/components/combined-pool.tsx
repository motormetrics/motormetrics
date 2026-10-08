import { Typography } from "@heroui/react";
import { formatExercise } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { BarRow } from "@web/components/shared/bar-row";
import { ReportStat } from "@web/components/shared/report";
import { getLatestCoeResults } from "@web/queries/coe/latest-results";
import type { COECategory } from "@web/types";

const CAR_CATEGORIES: { category: COECategory; color: string }[] = [
  { category: "Category A", color: "var(--chart-1)" },
  { category: "Category B", color: "var(--chart-2)" },
];

const formatWhole = (value: number): string => value.toLocaleString("en-SG");

const bidsPerCoe = (bids: number, quota: number): string =>
  quota > 0 ? (bids / quota).toFixed(2) : "–";

/**
 * The latest exercise's Category A and B quotas added together: the single
 * pool every car buyer would bid from if the two categories merged.
 */
export async function CombinedPool() {
  const results = await getLatestCoeResults();

  const categories = CAR_CATEGORIES.flatMap(({ category, color }) => {
    const result = results.find((row) => row.vehicleClass === category);
    return result ? [{ ...result, category, color }] : [];
  });
  const exercise = results[0];
  if (!exercise || categories.length < CAR_CATEGORIES.length) {
    return null;
  }

  const quota = categories.reduce((total, row) => total + row.quota, 0);
  const bids = categories.reduce((total, row) => total + row.bidsReceived, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3.5">
        {categories.map((row) => (
          <BarRow
            color={row.color}
            key={row.category}
            label={row.category}
            share={(row.quota / quota) * 100}
            value={`${formatWhole(row.quota)} COEs · ${Math.round((row.quota / quota) * 100)}%`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:flex sm:flex-wrap sm:gap-0">
        <ReportStat
          label="Combined quota"
          note="Category A plus B"
          value={formatWhole(quota)}
        />
        <ReportStat
          label="Combined bids"
          note="bids received"
          value={formatWhole(bids)}
        />
        <ReportStat
          label="Bids per COE, combined"
          note="one pool"
          value={bidsPerCoe(bids, quota)}
        />
        {categories.map((row) => (
          <ReportStat
            key={row.category}
            label={`Bids per COE, ${row.category.replace("Category", "Cat")}`}
            note="today"
            value={bidsPerCoe(row.bidsReceived, row.quota)}
          />
        ))}
      </div>
      <Typography.Paragraph color="muted" size="sm">
        {formatExercise(exercise)}, from LTA&apos;s bidding results. Category E
        is left out: LTA is still asking whether to keep it.
      </Typography.Paragraph>
    </div>
  );
}
