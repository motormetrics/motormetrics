import { cn, Table, Typography } from "@heroui/react";
import type { SummaryRow } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/summary";
import { SeriesSwatch } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/trend-chart";
import { MakeAvatar } from "@web/components/shared/make-avatar";

/** A make's column header: its logo and its chart line, then its name. */
function MakeHeader({
  logoUrl,
  name,
  series,
}: {
  logoUrl: string | null;
  name: string;
  series: "a" | "b";
}) {
  return (
    <span className="inline-flex items-center justify-end gap-2">
      <MakeAvatar logoUrl={logoUrl} make={name} size="sm" />
      <SeriesSwatch series={series} />
      {name}
    </span>
  );
}

/**
 * The comparison's four measures side by side, with the gap between the two
 * makes. The higher figure in each row is set bold rather than coloured, so
 * the lead reads the same in print, in dark mode and without colour vision;
 * the caption under the table says so once.
 */
export function SummaryTable({
  logoUrlA,
  logoUrlB,
  nameA,
  nameB,
  rows,
}: {
  logoUrlA: string | null;
  logoUrlB: string | null;
  nameA: string;
  nameB: string;
  rows: SummaryRow[];
}) {
  return (
    <Table variant="secondary">
      <Table.ScrollContainer>
        <Table.Content
          aria-label={`${nameA} and ${nameB} compared`}
          className="min-w-max tabular-nums"
        >
          <Table.Header>
            <Table.Column isRowHeader>Measure</Table.Column>
            <Table.Column className="text-right">
              <MakeHeader logoUrl={logoUrlA} name={nameA} series="a" />
            </Table.Column>
            <Table.Column className="text-right">
              <MakeHeader logoUrl={logoUrlB} name={nameB} series="b" />
            </Table.Column>
            <Table.Column className="text-right">Gap</Table.Column>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row id={row.id} key={row.id}>
                <Table.Cell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">{row.label}</span>
                    {row.note ? (
                      <Typography.Paragraph color="muted" size="xs">
                        {row.note}
                      </Typography.Paragraph>
                    ) : null}
                  </div>
                </Table.Cell>
                <Table.Cell
                  className={cn(
                    "text-right text-lg",
                    row.leader === "a" ? "font-bold" : "font-normal",
                  )}
                >
                  {row.a}
                </Table.Cell>
                <Table.Cell
                  className={cn(
                    "text-right text-lg",
                    row.leader === "b" ? "font-bold" : "font-normal",
                  )}
                >
                  {row.b}
                </Table.Cell>
                <Table.Cell className="text-right text-muted">
                  {row.gap}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
