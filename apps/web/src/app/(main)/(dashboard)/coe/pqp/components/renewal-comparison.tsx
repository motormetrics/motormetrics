import { formatCurrency } from "@motormetrics/utils";
import { ReportSection } from "@web/components/shared/report";
import {
  ReportCell,
  ReportRow,
  ReportTable,
} from "@web/components/shared/report-table";
import Typography from "@web/components/typography";
import type { Pqp } from "@web/types/coe";

/**
 * What renewing costs against bidding, in money, for the category the page is
 * already reporting on.
 *
 * This was a card with its own category tab strip, sitting directly beneath the
 * page's own — the duplication is why it read as a different page. It now takes
 * the selection from the URL like every other block and renders as a ruled
 * section.
 *
 * The bid column is the closing premium pro-rated to the term, which is the
 * only like comparison available: a premium buys ten years of COE, so half of
 * it is what five of those years cost.
 */
export function RenewalComparison({
  summary,
  term,
}: {
  summary: Pqp.CategorySummary;
  /** The term the page is quoting, so the matching row can be marked. */
  term: string;
}) {
  const rows = [
    {
      bid: summary.coePremium * 0.5,
      renew: summary.pqpCost5Year,
      saving: summary.savings5Year,
      term: "5",
      title: "5-year renewal",
    },
    {
      bid: summary.coePremium,
      renew: summary.pqpCost10Year,
      saving: summary.savings10Year,
      term: "10",
      title: "10-year renewal",
    },
  ];

  return (
    <ReportSection
      caption={`${summary.category} · against the latest closing premium`}
      title="What renewing costs against bidding"
    >
      <ReportTable
        columns={[
          { label: "Term" },
          { align: "end", label: "Renew at the PQP" },
          { align: "end", label: "Bid at the premium" },
          { align: "end", label: "Difference", width: "180px" },
        ]}
      >
        {rows.map((row) => (
          <ReportRow isActive={row.term === term} key={row.term}>
            <ReportCell className="font-bold text-base">{row.title}</ReportCell>
            <ReportCell align="end" className="font-extrabold text-lg">
              {formatCurrency(row.renew)}
            </ReportCell>
            <ReportCell align="end" className="font-semibold text-muted">
              {formatCurrency(row.bid)}
            </ReportCell>
            <ReportCell align="end">
              <span
                className={
                  row.saving >= 0
                    ? "font-bold text-[0.96875rem] text-success-soft-foreground tabular-nums"
                    : "font-bold text-[0.96875rem] text-warning-soft-foreground tabular-nums"
                }
              >
                {row.saving >= 0 ? "Saves " : "Costs "}
                {formatCurrency(Math.abs(row.saving))}
              </span>
            </ReportCell>
          </ReportRow>
        ))}
      </ReportTable>
      <Typography.TextSm className="font-medium text-muted">
        Estimates only. Both figures exclude processing and registration fees,
        the PQP is a three-month moving average that moves every month, and a
        bid may close anywhere either side of the last premium.
      </Typography.TextSm>
    </ReportSection>
  );
}
