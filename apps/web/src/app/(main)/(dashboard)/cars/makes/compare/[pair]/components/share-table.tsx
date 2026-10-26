import { cn, Table, Typography } from "@heroui/react";
import type { ShareRow } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/mix-rows";

/**
 * A mix as a table of shares, each make's own year to date as the base, so a
 * small make and a large one read on the same scale. Shared by the fuel type,
 * vehicle type and "Other" breakdown tables, which all have this shape. Rows
 * rather than stacked bars: the reader wants the figure, and two bars of five
 * segments cannot be read to the decimal.
 */
export function ShareTable({
  ariaLabel,
  firstColumn,
  nameA,
  nameB,
  rows,
}: {
  ariaLabel: string;
  /** "Fuel type (LTA)", "Vehicle type". */
  firstColumn: string;
  nameA: string;
  nameB: string;
  rows: ShareRow[];
}) {
  return (
    <Table variant="secondary">
      <Table.ScrollContainer>
        <Table.Content
          aria-label={ariaLabel}
          className="min-w-max tabular-nums"
        >
          <Table.Header>
            <Table.Column isRowHeader>{firstColumn}</Table.Column>
            <Table.Column className="text-right">{nameA}</Table.Column>
            <Table.Column className="text-right">{nameB}</Table.Column>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row id={row.key} key={row.key}>
                <Table.Cell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">{row.label}</span>
                    {row.gloss ? (
                      <Typography.Paragraph color="muted" size="xs">
                        {row.gloss}
                      </Typography.Paragraph>
                    ) : null}
                  </div>
                </Table.Cell>
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
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
