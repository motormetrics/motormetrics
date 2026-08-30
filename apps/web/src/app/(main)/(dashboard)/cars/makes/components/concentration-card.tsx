import { Typography } from "@heroui/react";
import { SurfaceCard } from "@web/components/shared/bento";
import {
  DonutGauge,
  type DonutSegment,
} from "@web/components/shared/donut-gauge";
import type { SearchParams } from "nuqs/server";
import { loadSearchParams } from "../search-params";
import { loadMakeRows } from "./make-rows";

/** How many makes the donut breaks out before folding the rest together. */
const LEADERS = 5;

export async function ConcentrationCard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const { rows, total } = await loadMakeRows(range, fuel);

  if (rows.length === 0) {
    return null;
  }

  const leaders = rows.slice(0, LEADERS);
  const rest = rows.slice(LEADERS).reduce((sum, row) => sum + row.count, 0);

  const segments: DonutSegment[] = leaders.map((row, index) => ({
    color: `var(--chart-${index + 1})`,
    label: row.make,
    value: row.count,
  }));
  if (rest > 0) {
    segments.push({
      color: "var(--chart-6)",
      label: "All other makes",
      value: rest,
    });
  }

  const leadersTotal = leaders.reduce((sum, row) => sum + row.count, 0);
  const leadersShare = total > 0 ? (leadersTotal / total) * 100 : 0;

  return (
    <SurfaceCard className="gap-1">
      <Typography.Paragraph color="muted" size="sm" className="text-lg">
        Concentration
      </Typography.Paragraph>
      <Typography.Heading level={3}>Top five vs the rest</Typography.Heading>
      <DonutGauge
        caption="top five share"
        centre={`${leadersShare.toFixed(0)}%`}
        segments={segments}
        title="Share of registrations held by the five largest makes"
      />
    </SurfaceCard>
  );
}
