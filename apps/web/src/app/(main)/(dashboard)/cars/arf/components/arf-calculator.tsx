"use client";

import { Input, Label, ListBox, Select, Table } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  ARF_SCHEDULES,
  calculateArf,
} from "@web/app/(main)/(dashboard)/cars/arf/components/arf-rates";
import { Headline, StatCell } from "@web/components/shared/overview";
import posthog from "posthog-js";
import { useMemo, useState } from "react";

const formatRate = (rate: number) => `${Math.round(rate * 100)}%`;

/**
 * The small caps label above each field. A span rather than
 * `Typography.Paragraph`: inside the `Select` that renders react-aria's `Text`,
 * which demands a slot.
 */
const FIELD_LABEL = "font-bold text-muted text-xs uppercase tracking-wider";

/**
 * The calculator strip, the headline it drives, and the band-by-band working
 * beneath it — the same report-family layout as the PARF calculator.
 */
export function ARFCalculator() {
  const [omvInput, setOmvInput] = useState("40000");
  const [scheduleKey, setScheduleKey] = useState(ARF_SCHEDULES[0].key);

  const omv = Number(omvInput.replace(/[^0-9.]/g, "")) || 0;
  const schedule =
    ARF_SCHEDULES.find(({ key }) => key === scheduleKey) ?? ARF_SCHEDULES[0];

  const { total, bands } = useMemo(
    () => calculateArf(omv, schedule.tiers),
    [omv, schedule],
  );
  const topBand = bands.at(-1);

  return (
    <>
      <div className="flex flex-wrap items-end gap-6 border-border border-y py-4">
        <div className="flex flex-col gap-2">
          <span className={FIELD_LABEL}>OMV</span>
          <Input
            aria-label="OMV"
            inputMode="numeric"
            onBlur={() =>
              posthog.capture("arf_calculator_used", {
                field: "omv",
                schedule: schedule.key,
              })
            }
            onChange={(event) => setOmvInput(event.target.value)}
            placeholder="e.g. 40,000"
            type="text"
            value={omvInput}
          />
        </div>
        <div className="flex min-w-64 flex-col gap-2">
          <Select
            onChange={(key) => {
              if (!key) return;
              posthog.capture("arf_calculator_used", {
                field: "schedule",
                schedule: key,
              });
              setScheduleKey(String(key));
            }}
            value={scheduleKey}
          >
            <Label>
              <span className={FIELD_LABEL}>COE obtained</span>
            </Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {ARF_SCHEDULES.map(({ key, label }) => (
                  <ListBox.Item id={key} key={key} textValue={label}>
                    {label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-14">
        <Headline
          caption={`${formatCurrency(omv)} OMV · COE obtained: ${schedule.label} · before VES and EEAI rebates`}
          label="ARF payable"
          value={formatCurrency(total)}
        />
        <div className="grid grid-cols-2 border-separator border-t">
          <StatCell
            label="Effective rate"
            note="ARF as a share of OMV"
            value={omv > 0 ? formatRate(total / omv) : "—"}
          />
          <StatCell
            label="Top band"
            note="rate on the last dollar of OMV"
            value={topBand ? formatRate(topBand.rate) : "—"}
          />
        </div>
      </div>

      {bands.length > 0 ? (
        <Table variant="secondary">
          <Table.ScrollContainer>
            <Table.Content
              aria-label="ARF by OMV band"
              className="tabular-nums"
            >
              <Table.Header>
                <Table.Column isRowHeader>OMV band</Table.Column>
                <Table.Column className="text-right">Rate</Table.Column>
                <Table.Column className="text-right">ARF</Table.Column>
              </Table.Header>
              <Table.Body>
                {bands.map(({ amount, from, rate, to }) => (
                  <Table.Row id={from} key={from}>
                    <Table.Cell className="font-bold text-base">
                      {formatCurrency(from)} – {formatCurrency(to)}
                    </Table.Cell>
                    <Table.Cell className="text-right font-semibold text-muted">
                      {formatRate(rate)}
                    </Table.Cell>
                    <Table.Cell className="text-right font-extrabold text-base">
                      {formatCurrency(amount)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      ) : null}
    </>
  );
}
