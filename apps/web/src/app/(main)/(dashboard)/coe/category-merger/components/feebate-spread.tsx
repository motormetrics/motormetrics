import { Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  averageGap,
  EXERCISES_PER_YEAR,
  gapOf,
  getPremiumGapPoints,
  widestGap,
} from "@web/app/(main)/(dashboard)/coe/category-merger/components/premium-gap";
import { THREE_BANDS } from "@web/app/(main)/(dashboard)/coe/category-merger/utils/proposal";
import { BarRow } from "@web/components/shared/bar-row";
import { ReportStat } from "@web/components/shared/report";

/** Both of LTA's options run from a $15,000 rebate to a $15,000 surcharge. */
const adjustments = THREE_BANDS.map(({ adjustment }) => adjustment);
const FEEBATE_SPREAD = Math.max(...adjustments) - Math.min(...adjustments);
const LARGEST_ADJUSTMENT = Math.max(...adjustments.map(Math.abs));

/**
 * Today's Category A–B gap beside the gap the feebate would put between the
 * lowest and highest bands, on one scale, so the size of LTA's proposed
 * difference reads against what the market produces on its own.
 */
export async function FeebateSpread() {
  const points = await getPremiumGapPoints();

  const latest = points.at(-1);
  if (!latest) {
    return null;
  }

  const widest = widestGap(points);
  const rows = [
    {
      color: "var(--chart-1)",
      label: `Category B over A, ${latest.label}`,
      value: gapOf(latest),
    },
    {
      color: "var(--chart-1)",
      label: "Category B over A, past-year average",
      value: Math.round(averageGap(points.slice(-EXERCISES_PER_YEAR))),
    },
    {
      color: "var(--chart-1)",
      label: `Category B over A, widest (${widest.label})`,
      value: gapOf(widest),
    },
    {
      color: "var(--chart-2)",
      label: "Feebate, top band over bottom band",
      value: FEEBATE_SPREAD,
    },
  ];
  const largest = Math.max(...rows.map((row) => Math.abs(row.value)), 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3.5">
        {rows.map(({ color, label, value }) => (
          <BarRow
            color={color}
            key={label}
            label={label}
            share={(Math.max(value, 0) / largest) * 100}
            value={formatCurrency(value)}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:flex sm:flex-wrap sm:gap-0">
        <ReportStat
          label="Largest adjustment vs Cat A"
          note={`share of the ${latest.label} premium`}
          value={`${Math.round((LARGEST_ADJUSTMENT / latest.categoryA) * 100)}%`}
        />
        <ReportStat
          label="Largest adjustment vs Cat B"
          note={`share of the ${latest.label} premium`}
          value={`${Math.round((LARGEST_ADJUSTMENT / latest.categoryB) * 100)}%`}
        />
      </div>
      <Typography.Paragraph color="muted" size="sm">
        Category gaps from LTA&apos;s bidding results; the feebate spread is the
        difference between LTA&apos;s proposed top-band surcharge and
        bottom-band rebate, the same under both options.
      </Typography.Paragraph>
    </div>
  );
}
