"use client";

import { Label, ListBox, NumberField, Select } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  ARF_SCHEDULES,
  bandLabel,
  calculateArf,
} from "@web/app/(main)/(dashboard)/cars/arf/components/arf-rates";
import { ArfSchedules } from "@web/app/(main)/(dashboard)/cars/arf/components/arf-schedules";
import { CalculatorPanel } from "@web/app/(main)/(dashboard)/cars/parf/components/calculator-panel";
import { SGD_FORMAT } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-rates";
import { Hairline } from "@web/components/shared/overview";
import posthog from "posthog-js";
import { useState } from "react";

const formatRate = (rate: number) => `${Math.round(rate * 100)}%`;

/**
 * The ARF calculator, laid out as the PARF calculator's so the two tools read
 * as a pair: the two fields under "Your car", and beside them the estimate,
 * every band of the selected schedule with what the OMV adds in each, and the
 * note. The figure beneath reads the same state.
 */
export function ARFCalculator() {
  const [omv, setOmv] = useState(40_000);
  const [scheduleKey, setScheduleKey] = useState(ARF_SCHEDULES[0].key);

  const schedule =
    ARF_SCHEDULES.find(({ key }) => key === scheduleKey) ?? ARF_SCHEDULES[0];
  const { total, bands } = calculateArf(omv, schedule.tiers);
  const topBand = bands.at(-1);
  const largestAmount = Math.max(...bands.map(({ amount }) => amount), 1);

  const figures = [
    {
      label: "Estimated ARF",
      value: formatCurrency(total),
      note: `Schedule: ${schedule.label}`,
    },
    {
      label: "Effective rate",
      value: omv > 0 ? `${((total / omv) * 100).toFixed(1)}%` : "—",
      note: "ARF as a share of OMV",
    },
    {
      label: "Top band",
      value: topBand ? formatRate(topBand.rate) : "—",
      note: "Rate on the last dollar of OMV",
    },
  ];

  // Bands the OMV does not reach stay in the list, so the whole schedule
  // reads at a glance.
  const rows = schedule.tiers.map(({ rate, upTo }, index) => {
    const from = schedule.tiers[index - 1]?.upTo ?? 0;
    const amount = bands[index]?.amount ?? 0;
    return {
      amount: formatCurrency(amount),
      fraction: amount / largestAmount,
      isActive: amount > 0,
      label: bandLabel(from, upTo),
      rate: formatRate(rate),
    };
  });

  return (
    <>
      <CalculatorPanel
        amountHeading="ARF"
        figures={figures}
        labelHeading="OMV band"
        note="How this is calculated: each band of the OMV is charged at its own rate, and the bands are added up, before any VES or EEAI rebate or surcharge. Estimates only, not financial advice."
        rows={rows}
      >
        <NumberField
          formatOptions={SGD_FORMAT}
          fullWidth
          maxValue={1_000_000}
          minValue={0}
          onBlur={() =>
            posthog.capture("arf_calculator_used", {
              field: "omv",
              schedule: schedule.key,
            })
          }
          onChange={(value) => setOmv(Number.isFinite(value) ? value : 0)}
          value={omv}
        >
          <Label>OMV</Label>
          <NumberField.Group>
            <NumberField.Input />
          </NumberField.Group>
        </NumberField>
        <Select
          fullWidth
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
          <Label>COE obtained</Label>
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
      </CalculatorPanel>

      <Hairline />
      <ArfSchedules omv={omv} scheduleKey={schedule.key} />
    </>
  );
}
