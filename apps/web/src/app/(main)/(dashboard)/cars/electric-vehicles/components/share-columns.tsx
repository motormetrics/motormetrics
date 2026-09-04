"use client";

import {
  ColumnChart,
  type ColumnChartColumn,
} from "@web/components/shared/column-chart";
import { parseAsString, useQueryState } from "nuqs";
import posthog from "posthog-js";

/**
 * The EV share column chart. Selecting a column moves the whole page to that
 * month, which is why this is a client island — the columns themselves are
 * computed on the server and arrive as props.
 */
export function ShareColumns({
  columns,
  selectedMonth,
}: {
  columns: ColumnChartColumn[];
  /** `yyyy-MM`, the key of the highlighted column. */
  selectedMonth: string;
}) {
  const [, setMonth] = useQueryState(
    "month",
    parseAsString.withDefault(selectedMonth).withOptions({ shallow: false }),
  );

  return (
    <ColumnChart
      columns={columns}
      height={220}
      highlightKey={selectedMonth}
      onSelect={(month) => {
        posthog.capture("dashboard_filter_changed", {
          filter: "month",
          value: month,
        });
        setMonth(month);
      }}
    />
  );
}
