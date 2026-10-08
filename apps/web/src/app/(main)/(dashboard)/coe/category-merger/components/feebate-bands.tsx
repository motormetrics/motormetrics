import { Typography } from "@heroui/react";
import {
  type FeebateBand,
  formatAdjustment,
} from "@web/app/(main)/(dashboard)/coe/category-merger/utils/proposal";
import {
  ReportCell,
  ReportRow,
  ReportTable,
} from "@web/components/shared/report-table";

/** One of LTA's two band options, as the paper tabulates it. */
export function FeebateBands({
  bands,
  title,
}: {
  bands: FeebateBand[];
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Typography.Heading level={3}>{title}</Typography.Heading>
      <ReportTable
        columns={[
          { label: "Band" },
          { label: "Adjustment" },
          { label: "OMV percentile" },
          { label: "Typical models (LTA, non-exhaustive)" },
        ]}
      >
        {bands.map(({ adjustment, band, models, percentile }) => (
          <ReportRow key={band}>
            <ReportCell className="font-semibold">{band}</ReportCell>
            <ReportCell className="whitespace-nowrap font-semibold">
              {formatAdjustment(adjustment)}
            </ReportCell>
            <ReportCell className="whitespace-nowrap text-muted">
              {percentile}
            </ReportCell>
            {/* Wraps rather than widening the scroll: a dozen model names on
                one line would push the table past 1,000px. */}
            <ReportCell className="min-w-72 max-w-xl whitespace-normal text-muted">
              {models.join(", ")}
            </ReportCell>
          </ReportRow>
        ))}
      </ReportTable>
    </div>
  );
}
