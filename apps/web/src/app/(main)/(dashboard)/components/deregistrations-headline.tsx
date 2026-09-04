import { NumberValue } from "@heroui-pro/react";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/app/(main)/(dashboard)/cars/components/format-month";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import {
  changeRatio,
  sumByMonth,
  windowEndingAt,
} from "@web/app/(main)/(dashboard)/components/overview-series";
import { ColumnChart } from "@web/components/shared/column-chart";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { Headline } from "@web/components/shared/overview";
import { getDeregistrations } from "@web/queries/deregistrations";
import type { SearchParams } from "nuqs/server";

/** Months drawn in the column chart, the selected one last. */
const CHART_MONTHS = 8;

const formatTick = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber - 1).toLocaleString("en-SG", {
    month: "short",
  });
};

/**
 * The second headline figure: vehicles deregistered in the selected month.
 *
 * The deregistration feed can trail the registration one, so the window ends
 * at the newest month at or before the selection and the caption names it.
 */
export async function DeregistrationsHeadline({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const month = await resolveCarsMonth(searchParams);
  const rows = await getDeregistrations();
  const series = windowEndingAt(sumByMonth(rows), month, CHART_MONTHS);

  const current = series.at(-1);
  if (!current) {
    return null;
  }
  const previous = series.at(-2);

  return (
    <div className="flex flex-col gap-5">
      <Headline
        caption={
          <>
            vehicles taken off the road in {formatMonthName(current.month)} · vs{" "}
            {previous ? formatMonthName(previous.month) : "the previous month"}
          </>
        }
        delta={
          <DeltaChip
            value={changeRatio(current.total, previous?.total) * 100}
          />
        }
        label="Deregistrations"
        value={
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={current.total}
          />
        }
      />
      <ColumnChart
        columns={series.map((item) => ({
          key: item.month,
          label: formatTick(item.month),
          tooltip: {
            rows: [
              {
                label: "Deregistered",
                value: item.total.toLocaleString("en-SG"),
              },
            ],
            title: formatMonthLabel(item.month),
          },
          value: item.total,
        }))}
        height={170}
        highlightKey={current.month}
      />
    </div>
  );
}
