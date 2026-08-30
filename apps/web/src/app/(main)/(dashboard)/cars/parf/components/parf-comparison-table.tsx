import { Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils";
import {
  AGE_BRACKETS,
  NEW_CAP,
  OLD_CAP,
} from "@web/app/(main)/(dashboard)/cars/parf/components/parf-rates";
import { ReportSection } from "@web/components/shared/report";
import {
  DeltaText,
  ReportCell,
  ReportRow,
  ReportTable,
} from "@web/components/shared/report-table";

/**
 * The full schedule either side of Budget 2026.
 *
 * The change column is in percentage points rather than percent — the rates are
 * themselves percentages, and "−45pp" is the only reading that is not ambiguous.
 */
export function PARFComparisonTable() {
  return (
    <ReportSection
      caption={`Rebate cap ${formatCurrency(OLD_CAP)} → ${formatCurrency(NEW_CAP)} · effective from the 2nd bidding exercise, February 2026`}
      title="Rebate rates by vehicle age"
    >
      <ReportTable
        columns={[
          { label: "Vehicle age" },
          { align: "end", label: "Before Budget 2026" },
          { align: "end", label: "After Budget 2026" },
          { align: "end", label: "Change", width: "150px" },
        ]}
      >
        {AGE_BRACKETS.map(({ key, label, newRate, oldRate }) => {
          const change = (newRate - oldRate) * 100;

          return (
            <ReportRow key={key}>
              <ReportCell className="font-bold text-base">{label}</ReportCell>
              <ReportCell align="end" className="font-semibold text-muted">
                {(oldRate * 100).toFixed(0)}%
              </ReportCell>
              <ReportCell align="end" className="font-extrabold text-lg">
                {(newRate * 100).toFixed(0)}%
              </ReportCell>
              <ReportCell align="end">
                {change === 0 ? (
                  <span className="font-semibold text-muted text-sm">
                    No change
                  </span>
                ) : (
                  <DeltaText unit="pp" value={change} />
                )}
              </ReportCell>
            </ReportRow>
          );
        })}
      </ReportTable>
      <Typography.Paragraph color="muted" size="sm">
        Rates apply to the ARF paid on the vehicle, and the rebate is capped
        whichever bracket it falls in.
      </Typography.Paragraph>
    </ReportSection>
  );
}
