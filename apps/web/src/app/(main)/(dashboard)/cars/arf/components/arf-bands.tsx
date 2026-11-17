"use client";

import { Typography } from "@heroui/react";
import { DataGrid, type DataGridColumn } from "@heroui-pro/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  type ArfBand,
  type ArfSchedule,
  bandLabel,
} from "@web/app/(main)/(dashboard)/cars/arf/components/arf-rates";
import { FigureCard } from "@web/components/shared/figure-card";

const formatRate = (rate: number) => `${Math.round(rate * 100)}%`;

interface BandRow {
  /** What the entered OMV adds in this band; `undefined` when not reached. */
  amount: number | undefined;
  from: number;
  label: string;
  rate: number;
}

const columns: DataGridColumn<BandRow>[] = [
  {
    accessorKey: "label",
    header: "OMV band",
    id: "label",
    isRowHeader: true,
    minWidth: 160,
  },
  {
    align: "end",
    cell: (row) => (
      <Typography.Paragraph className="text-end tabular-nums" size="sm">
        {formatRate(row.rate)}
      </Typography.Paragraph>
    ),
    header: "Rate",
    id: "rate",
    width: 72,
  },
  {
    align: "end",
    cell: (row) =>
      row.amount === undefined ? (
        <Typography.Paragraph className="text-end" color="muted" size="sm">
          Not reached
        </Typography.Paragraph>
      ) : (
        <Typography.Paragraph
          className="text-end tabular-nums"
          size="sm"
          weight="semibold"
        >
          {formatCurrency(row.amount)}
        </Typography.Paragraph>
      ),
    header: "Your ARF",
    id: "amount",
    width: 120,
  },
];

/**
 * Every band of the selected schedule, with what the entered OMV adds in
 * each. Bands the OMV does not reach stay in the table, so the whole schedule
 * reads at a glance.
 */
export function ArfBands({
  bands,
  schedule,
}: {
  bands: ArfBand[];
  schedule: ArfSchedule;
}) {
  const rows: BandRow[] = schedule.tiers.map(({ rate, upTo }, index) => {
    const from = schedule.tiers[index - 1]?.upTo ?? 0;
    return {
      amount: bands[index]?.amount,
      from,
      label: bandLabel(from, upTo),
      rate,
    };
  });

  return (
    <FigureCard
      description={`Schedule: ${schedule.label}`}
      title="ARF band by band"
    >
      <DataGrid
        aria-label={`ARF by OMV band, COE obtained ${schedule.label}`}
        columns={columns}
        data={rows}
        getRowId={(row) => row.from}
        variant="secondary"
      />
    </FigureCard>
  );
}
