import { Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { ARF_SCHEDULES } from "@web/app/(main)/(dashboard)/cars/arf/components/arf-rates";
import { ReportSection } from "@web/components/shared/report";
import {
  ReportCell,
  ReportRow,
  ReportTable,
} from "@web/components/shared/report-table";

const [current] = ARF_SCHEDULES;

/** "First $20,000", "$20,001 to $40,000", "Above $80,000". */
function bandLabel(from: number, upTo: number | null): string {
  if (from === 0 && upTo !== null) {
    return `First ${formatCurrency(upTo)}`;
  }
  if (upTo === null) {
    return `Above ${formatCurrency(from)}`;
  }
  return `${formatCurrency(from + 1)} to ${formatCurrency(upTo)}`;
}

/** The current car ARF tiers, with the earlier schedules noted beneath. */
export function ARFTierTable() {
  return (
    <ReportSection
      caption="Cars with COEs obtained from the 2nd bidding exercise, February 2023"
      title="ARF rates by OMV"
    >
      <ReportTable
        columns={[{ label: "OMV band" }, { align: "end", label: "ARF rate" }]}
      >
        {current.tiers.map(({ rate, upTo }, index) => {
          const from = current.tiers[index - 1]?.upTo ?? 0;

          return (
            <ReportRow key={from}>
              <ReportCell className="font-bold text-base">
                {bandLabel(from, upTo)}
              </ReportCell>
              <ReportCell align="end" className="font-extrabold text-lg">
                {Math.round(rate * 100)}%
              </ReportCell>
            </ReportRow>
          );
        })}
      </ReportTable>
      <Typography.Paragraph color="muted" size="sm">
        Cars with COEs from the 2nd February 2022 exercise to the 1st February
        2023 exercise paid 100% on the first $20,000, 140% up to $50,000, 180%
        up to $80,000 and 220% above that. Before February 2022, everything
        above $50,000 was taxed at 180%.
      </Typography.Paragraph>
    </ReportSection>
  );
}
