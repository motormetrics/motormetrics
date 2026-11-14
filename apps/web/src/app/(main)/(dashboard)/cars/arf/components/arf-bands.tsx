"use client";

import { cn, Table } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  type ArfBand,
  type ArfSchedule,
  bandLabel,
} from "@web/app/(main)/(dashboard)/cars/arf/components/arf-rates";
import { SectionHead, SourceNote } from "@web/components/shared/overview";

const formatRate = (rate: number) => `${Math.round(rate * 100)}%`;

/**
 * Figure 2: every band of the selected schedule, with what the entered OMV
 * adds in each and a bar for its share of the total. Bands the OMV does not
 * reach stay in the table, so the whole schedule reads at a glance.
 */
export function ArfBands({
  bands,
  schedule,
  total,
}: {
  bands: ArfBand[];
  schedule: ArfSchedule;
  total: number;
}) {
  const topBand = bands.at(-1);
  const caption = topBand
    ? `The OMV reaches ${bands.length} of the ${schedule.tiers.length} bands. The top band it reaches, at ${formatRate(topBand.rate)}, adds ${formatCurrency(topBand.amount)}, ${((topBand.amount / total) * 100).toFixed(1)}% of the ARF.`
    : "Enter an OMV to see what each band adds.";

  return (
    <section className="flex scroll-mt-20 flex-col gap-4" id="arf-bands">
      <SectionHead
        caption={caption}
        eyebrow={`Figure 2 · COE obtained: ${schedule.label}`}
        title="ARF band by band"
      />
      <Table variant="secondary">
        <Table.ScrollContainer>
          <Table.Content
            aria-label={`ARF by OMV band, COE obtained ${schedule.label}`}
            className="tabular-nums"
          >
            <Table.Header>
              <Table.Column isRowHeader>OMV band</Table.Column>
              <Table.Column className="text-right">Rate</Table.Column>
              <Table.Column className="max-lg:hidden">
                Share of your ARF
              </Table.Column>
              <Table.Column className="text-right">Your ARF</Table.Column>
            </Table.Header>
            <Table.Body>
              {schedule.tiers.map(({ rate, upTo }, index) => {
                const from = schedule.tiers[index - 1]?.upTo ?? 0;
                const band = bands[index];
                const isTop = band !== undefined && band === topBand;
                return (
                  <Table.Row id={from} key={from}>
                    <Table.Cell
                      className={cn(
                        "font-semibold",
                        isTop && "text-accent-strong",
                      )}
                    >
                      {bandLabel(from, upTo)}
                    </Table.Cell>
                    <Table.Cell className="text-right text-muted">
                      {formatRate(rate)}
                    </Table.Cell>
                    <Table.Cell className="max-lg:hidden">
                      <span className="block h-1.5 w-48 bg-surface-secondary">
                        <span
                          className="block h-full bg-chart-1"
                          style={{
                            width: `${band && total > 0 ? ((band.amount / total) * 100).toFixed(1) : 0}%`,
                          }}
                        />
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-right font-semibold">
                      {band ? formatCurrency(band.amount) : "Not reached"}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      <SourceNote>
        Source: LTA · Each rate is charged only on the part of the OMV inside
        its band. Figures are before any VES or EEAI rebate or surcharge.
      </SourceNote>
    </section>
  );
}
