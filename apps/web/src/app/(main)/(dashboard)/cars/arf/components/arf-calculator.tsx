"use client";

import {
  Description,
  Label,
  ListBox,
  NumberField,
  Select,
  Typography,
} from "@heroui/react";
import { ArfBands } from "@web/app/(main)/(dashboard)/cars/arf/components/arf-bands";
import {
  ARF_SCHEDULES,
  calculateArf,
} from "@web/app/(main)/(dashboard)/cars/arf/components/arf-rates";
import { SGD_FORMAT } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-rates";
import { FigureCard } from "@web/components/shared/figure-card";
import { type KpiTile, KpiTiles } from "@web/components/shared/kpi-tiles";
import posthog from "posthog-js";
import { useState } from "react";

/**
 * The ARF calculator, laid out as the PARF calculator so the two tools read
 * as a pair: the inputs in one card, the estimate as KPI tiles under it, then
 * the selected schedule band by band.
 */
export function ARFCalculator() {
  const [omv, setOmv] = useState(40_000);
  const [scheduleKey, setScheduleKey] = useState(ARF_SCHEDULES[0].key);

  const schedule =
    ARF_SCHEDULES.find(({ key }) => key === scheduleKey) ?? ARF_SCHEDULES[0];
  const { total, bands } = calculateArf(omv, schedule.tiers);
  const topBand = bands.at(-1);

  const tiles: KpiTile[] = [
    {
      format: "currency",
      note: `Schedule: ${schedule.label}`,
      title: "Estimated ARF",
      value: total,
    },
    {
      format: "percent",
      note: "ARF as a share of OMV",
      title: "Effective rate",
      value: omv > 0 ? (total / omv) * 100 : 0,
    },
    {
      format: "percent",
      note: "Rate on the last dollar of OMV",
      title: "Top band",
      value: topBand ? topBand.rate * 100 : 0,
    },
    {
      format: "count",
      note: `of ${schedule.tiers.length} in this schedule`,
      title: "Bands reached",
      value: bands.length,
    },
  ];

  return (
    <>
      <FigureCard title="Your car">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <Description>Find it on your vehicle log card</Description>
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
        </div>
      </FigureCard>

      <div className="flex flex-col gap-4">
        <div aria-live="polite">
          <KpiTiles tiles={tiles} />
        </div>
        <Typography.Paragraph className="max-w-prose" color="muted" size="sm">
          How this is calculated: LTA charges the ARF on the car&apos;s OMV,
          band by band, each rate only on the part of the OMV inside its band,
          at the rates in force when the COE was obtained. Figures are before
          any VES or EEAI rebate or surcharge. Estimates only, not financial
          advice; check your figures on OneMotoring.
        </Typography.Paragraph>
      </div>

      <ArfBands bands={bands} schedule={schedule} />
    </>
  );
}
