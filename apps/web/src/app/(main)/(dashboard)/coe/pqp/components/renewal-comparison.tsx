import { formatCurrency } from "@motormetrics/utils";
import { ReportSection } from "@web/components/shared/report";
import {
  ReportCell,
  ReportRow,
  ReportTable,
} from "@web/components/shared/report-table";
import Typography from "@web/components/typography";
import type { Pqp } from "@web/types/coe";

/** The two terms a COE can be renewed for, and what each costs of the PQP. */
const TERMS = [
  { key: "5", label: "5-year", factor: 0.5 },
  { key: "10", label: "10-year", factor: 1 },
];

/**
 * What renewing costs against bidding, in money.
 *
 * Every category and both terms are on the page at once rather than keyed to
 * the controls at the top: this section sits at the foot of a long page, and
 * reading one row of it should not mean scrolling back up to the filter bar and
 * down again. The row matching the current selection is tinted so the two stay
 * connected.
 *
 * The bid column is the closing premium pro-rated to the term, which is the
 * only like comparison available: a premium buys ten years of COE, so half of
 * it is what five of those years cost.
 */
export function RenewalComparison({
  category,
  summaries,
  term,
}: {
  /** The category the page's controls are on, for the row tint. */
  category: string;
  summaries: Pqp.CategorySummary[];
  /** The term the page's controls are on, for the row tint. */
  term: string;
}) {
  const rows = summaries.flatMap((summary) =>
    TERMS.map(({ factor, key, label }) => ({
      bid: summary.coePremium * factor,
      category: summary.category,
      key: `${summary.category}-${key}`,
      label: `${summary.category} · ${label}`,
      renew: summary.pqpRate * factor,
      saving: summary.coePremium * factor - summary.pqpRate * factor,
      term: key,
    })),
  );

  return (
    <ReportSection
      caption="Against the latest closing premium, per category and term"
      title="What renewing costs against bidding"
    >
      <ReportTable
        columns={[
          { label: "Category and term" },
          { align: "end", label: "Renew at the PQP" },
          { align: "end", label: "Bid at the premium" },
          { align: "end", label: "Difference", width: "180px" },
        ]}
      >
        {rows.map((row) => (
          <ReportRow
            isActive={row.category === category && row.term === term}
            key={row.key}
          >
            <ReportCell className="font-bold text-base">{row.label}</ReportCell>
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
