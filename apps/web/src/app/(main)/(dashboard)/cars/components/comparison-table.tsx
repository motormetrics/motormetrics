import { Table } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { DeltaChip } from "@web/components/shared/delta-chip";
import type { Month } from "@web/types";
import type { Registration } from "@web/types/cars";
import { percentageChange } from "@web/utils/change-ratio";
import { format, subMonths } from "date-fns";

/** The month before `currentMonth`, or the nearest month on record. */
export function getDefaultMonthB(
  currentMonth: string,
  months: Month[],
): string {
  const previousMonth = format(
    subMonths(new Date(`${currentMonth}-01`), 1),
    "yyyy-MM",
  );
  if (months.includes(previousMonth)) {
    return previousMonth;
  }
  return months[1] ?? months[0] ?? currentMonth;
}

const formatCount = (value: number): string => value.toLocaleString("en-SG");

/** The change of the first month on the second; a dash where there is no base. */
function Change({ current, previous }: { current: number; previous: number }) {
  if (previous <= 0) {
    return (
      <>
        <span aria-hidden>—</span>
        <span className="sr-only">No comparable figure</span>
      </>
    );
  }

  return <DeltaChip value={percentageChange(current, previous)} />;
}

/**
 * Two months side by side for one breakdown, closed by the months' totals.
 * The change is the first month on the second.
 */
export function ComparisonTable({
  column,
  monthA,
  monthB,
  totalLabel,
  type,
}: {
  /** "Fuel type" or "Vehicle type", the row header's column. */
  column: string;
  monthA: Registration;
  monthB: Registration;
  /** "All fuel types", the label of the totals row. */
  totalLabel: string;
  type: "fuelType" | "vehicleType";
}) {
  const count = (month: Registration, name: string) =>
    month[type].find((item) => item.name === name)?.count ?? 0;
  const names = Array.from(
    new Set([...monthA[type], ...monthB[type]].map((item) => item.name)),
  );
  const rows = names
    .map((name) => ({
      countA: count(monthA, name),
      countB: count(monthB, name),
      name,
    }))
    .sort((first, second) => second.countA - first.countA);
  const labelA = formatDateToMonthYear(monthA.month);
  const labelB = formatDateToMonthYear(monthB.month);

  return (
    <Table variant="secondary">
      <Table.ScrollContainer>
        <Table.Content
          aria-label={`New cars by ${column.toLowerCase()}, ${labelA} against ${labelB}`}
          className="min-w-max tabular-nums"
        >
          <Table.Header>
            <Table.Column isRowHeader>{column}</Table.Column>
            <Table.Column className="text-right">{labelA}</Table.Column>
            <Table.Column className="text-right">{labelB}</Table.Column>
            <Table.Column className="text-right">Change</Table.Column>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row id={row.name} key={row.name}>
                <Table.Cell className="font-semibold">{row.name}</Table.Cell>
                <Table.Cell className="text-right">
                  {formatCount(row.countA)}
                </Table.Cell>
                <Table.Cell className="text-right">
                  {formatCount(row.countB)}
                </Table.Cell>
                <Table.Cell className="text-right">
                  <Change current={row.countA} previous={row.countB} />
                </Table.Cell>
              </Table.Row>
            ))}
            <Table.Row id="total">
              <Table.Cell className="font-semibold">{totalLabel}</Table.Cell>
              <Table.Cell className="text-right font-semibold">
                {formatCount(monthA.total)}
              </Table.Cell>
              <Table.Cell className="text-right font-semibold">
                {formatCount(monthB.total)}
              </Table.Cell>
              <Table.Cell className="text-right">
                <Change current={monthA.total} previous={monthB.total} />
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
