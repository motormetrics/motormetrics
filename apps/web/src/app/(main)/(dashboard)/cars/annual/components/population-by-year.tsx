import type { PopulationEntity } from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { ColumnChart } from "@web/components/shared/column-chart";
import { SectionHead } from "@web/components/shared/overview";

/** Years drawn in the column chart. */
const CHART_YEARS = 10;

const numberFormatter = new Intl.NumberFormat("en-SG", {
  maximumFractionDigits: 0,
});

const formatChange = (previous: number | undefined, value: number) => {
  if (previous === undefined || previous === 0) {
    return "—";
  }
  const ratio = (value - previous) / previous;
  return `${ratio >= 0 ? "+" : "−"}${Math.abs(ratio * 100).toFixed(1)}%`;
};

/**
 * The run of years as columns. The series is computed on the server and the
 * chart is only a client island for its hover tooltip.
 */
export function PopulationByYear({
  entity,
  years,
}: {
  entity: PopulationEntity;
  years: string[];
}) {
  const offset = Math.max(0, years.length - CHART_YEARS);
  const columns = years.slice(offset).map((year, index) => {
    const position = offset + index;
    const value = entity.series[position] ?? 0;
    return {
      key: year,
      label: year,
      tooltip: {
        rows: [
          { label: "Population", value: numberFormatter.format(value) },
          {
            label: "Change",
            value: formatChange(entity.series[position - 1], value),
          },
        ],
        title: `${year} · ${entity.name}`,
      },
      value,
    };
  });

  return (
    <div className="flex flex-col gap-7">
      <SectionHead
        caption={`${entity.name} · hover a column for detail`}
        eyebrow="Trend"
        size="lg"
        title="Population by year"
      />
      <ColumnChart baseline="trimmed" columns={columns} height={260} />
    </div>
  );
}
