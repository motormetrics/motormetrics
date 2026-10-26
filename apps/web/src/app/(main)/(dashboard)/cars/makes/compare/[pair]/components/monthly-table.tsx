import { cn, Table } from "@heroui/react";
import type { MonthlyRow } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/summary";

/**
 * The trend chart's figures as a table, newest month first, for readers who
 * want the numbers and for the search engines that cannot read a chart. The
 * month's higher count is set bold.
 */
export function MonthlyTable({
  nameA,
  nameB,
  rows,
}: {
  nameA: string;
  nameB: string;
  rows: MonthlyRow[];
}) {
  return (
    <Table variant="secondary">
      <Table.ScrollContainer>
        <Table.Content
          aria-label={`${nameA} and ${nameB} registrations by month`}
          className="min-w-max tabular-nums"
        >
          <Table.Header>
            <Table.Column isRowHeader>Month</Table.Column>
            <Table.Column className="text-right">{nameA}</Table.Column>
            <Table.Column className="text-right">{nameB}</Table.Column>
            <Table.Column className="text-right">Ahead by</Table.Column>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row id={row.key} key={row.key}>
                <Table.Cell>{row.month}</Table.Cell>
                <Table.Cell
                  className={cn(
                    "text-right",
                    row.leader === "a" ? "font-bold" : "font-normal",
                  )}
                >
                  {row.a}
                </Table.Cell>
                <Table.Cell
                  className={cn(
                    "text-right",
                    row.leader === "b" ? "font-bold" : "font-normal",
                  )}
                >
                  {row.b}
                </Table.Cell>
                <Table.Cell className="text-right text-muted">
                  {row.aheadBy}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
