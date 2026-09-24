"use client";

import { Input, Label, ListBox, Select } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  ARF_SCHEDULES,
  calculateArf,
} from "@web/app/(main)/(dashboard)/cars/arf/components/arf-rates";
import {
  ReportEyebrow,
  ReportHeadline,
  ReportStat,
} from "@web/components/shared/report";
import {
  ReportCell,
  ReportRow,
  ReportTable,
} from "@web/components/shared/report-table";
import posthog from "posthog-js";
import { useMemo, useState } from "react";

const formatRate = (rate: number) => `${Math.round(rate * 100)}%`;

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
          <ReportEyebrow>OMV</ReportEyebrow>
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
              <ReportEyebrow>COE obtained</ReportEyebrow>
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

      <ReportHeadline
        label="ARF payable"
        stats={
          <>
            <ReportStat
              label="Effective rate"
              note="ARF as a share of OMV"
              value={omv > 0 ? formatRate(total / omv) : "—"}
            />
            <ReportStat
              label="Top band"
              note="rate on the last dollar of OMV"
              value={topBand ? formatRate(topBand.rate) : "—"}
            />
          </>
        }
        sub={`${formatCurrency(omv)} OMV · COE obtained: ${schedule.label} · before VES and EEAI rebates`}
        value={formatCurrency(total)}
      />

      {bands.length > 0 ? (
        <ReportTable
          columns={[
            { label: "OMV band" },
            { align: "end", label: "Rate" },
            { align: "end", label: "ARF" },
          ]}
        >
          {bands.map(({ amount, from, rate, to }) => (
            <ReportRow key={from}>
              <ReportCell className="font-bold text-base">
                {formatCurrency(from)} – {formatCurrency(to)}
              </ReportCell>
              <ReportCell align="end" className="font-semibold text-muted">
                {formatRate(rate)}
              </ReportCell>
              <ReportCell align="end" className="font-extrabold text-base">
                {formatCurrency(amount)}
              </ReportCell>
            </ReportRow>
          ))}
        </ReportTable>
      ) : null}
    </>
  );
}
