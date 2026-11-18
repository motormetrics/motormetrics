"use client";

import { Table } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { useCoeOverview } from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import {
  COE_CATEGORIES,
  formatMonth,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import type { CoeOverviewData } from "@web/app/(main)/(dashboard)/coe/components/overview-figures";
import type { ExerciseRange } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { SectionHead } from "@web/components/shared/overview";

/**
 * Every category's closing premium for the exercises shown, most recent
 * first. `data` holds the full history, so changing the range draws from
 * props alone.
 */
export function ClosingPremiumsView({
  data,
  range,
}: {
  data: CoeOverviewData;
  range: ExerciseRange;
}) {
  const exercises = data.history.slice(-Number(range)).reverse();

  return (
    <div className="flex flex-col gap-4">
      <SectionHead
        caption={`Last ${exercises.length} exercises, most recent first.`}
        title="Closing premiums"
      />
      <Table variant="secondary">
        <Table.ScrollContainer>
          <Table.Content
            aria-label={`Closing premiums by category, last ${exercises.length} exercises`}
            className="min-w-max tabular-nums"
          >
            <Table.Header>
              <Table.Column isRowHeader>Exercise</Table.Column>
              {COE_CATEGORIES.map((category) => (
                <Table.Column className="text-right" key={category}>
                  {category}
                </Table.Column>
              ))}
            </Table.Header>
            <Table.Body>
              {exercises.map((exercise) => (
                <Table.Row id={exercise.key} key={exercise.key}>
                  <Table.Cell className="font-semibold">
                    {formatMonth(exercise.month)},{" "}
                    {exercise.biddingNo === 1 ? "1st" : "2nd"}
                  </Table.Cell>
                  {COE_CATEGORIES.map((category) => {
                    const premium = exercise.results[category]?.premium;
                    return (
                      <Table.Cell className="text-right" key={category}>
                        {premium === undefined ? "—" : formatCurrency(premium)}
                      </Table.Cell>
                    );
                  })}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  );
}

/** The table on the range in the URL; render inside `<Suspense>`. */
export function ClosingPremiumsSelected({ data }: { data: CoeOverviewData }) {
  const { range } = useCoeOverview();

  return <ClosingPremiumsView data={data} range={range} />;
}
