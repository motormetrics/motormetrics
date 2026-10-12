import { cn, Table, Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
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
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-4">
        <Typography.Heading level={2}>
          What renewing costs against bidding
        </Typography.Heading>
        <Typography.Paragraph>
          Against the latest closing premium, per category and term
        </Typography.Paragraph>
      </div>
      <Table variant="secondary">
        <Table.ScrollContainer>
          <Table.Content
            aria-label="What renewing costs against bidding"
            className="min-w-max tabular-nums"
          >
            <Table.Header>
              <Table.Column isRowHeader>Category and term</Table.Column>
              <Table.Column className="text-right">
                Renew at the PQP
              </Table.Column>
              <Table.Column className="text-right">
                Bid at the premium
              </Table.Column>
              <Table.Column className="text-right">Difference</Table.Column>
            </Table.Header>
            <Table.Body>
              {rows.map((row) => (
                <Table.Row
                  className={cn(
                    row.category === category &&
                      row.term === term &&
                      "bg-accent-soft-2",
                  )}
                  id={row.key}
                  key={row.key}
                >
                  <Table.Cell className="font-bold text-base">
                    {row.label}
                  </Table.Cell>
                  <Table.Cell className="text-right font-extrabold text-lg">
                    {formatCurrency(row.renew)}
                  </Table.Cell>
                  <Table.Cell className="text-right font-semibold text-muted">
                    {formatCurrency(row.bid)}
                  </Table.Cell>
                  <Table.Cell className="text-right font-bold text-base text-muted-strong">
                    {row.saving >= 0 ? "Saves " : "Costs "}
                    {formatCurrency(Math.abs(row.saving))}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      <Typography.Paragraph color="muted" size="sm">
        Estimates only. Both figures exclude processing and registration fees,
        the PQP is a three-month moving average that moves every month, and a
        bid may close anywhere either side of the last premium.
      </Typography.Paragraph>
    </section>
  );
}
