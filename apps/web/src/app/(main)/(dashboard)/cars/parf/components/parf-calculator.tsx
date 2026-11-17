"use client";

import {
  Description,
  Label,
  ListBox,
  NumberField,
  Select,
  Typography,
} from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  AGE_BRACKETS,
  calculateParf,
  NEW_CAP,
  OLD_CAP,
  SGD_FORMAT,
} from "@web/app/(main)/(dashboard)/cars/parf/components/parf-rates";
import { ParfSchedule } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-schedule";
import { FigureCard } from "@web/components/shared/figure-card";
import { type KpiTile, KpiTiles } from "@web/components/shared/kpi-tiles";
import posthog from "posthog-js";
import { useState } from "react";

/** A COE runs for 10 years; the COE rebate is pro-rated over its months. */
const COE_MONTHS = 120;

const toNumber = (value: number) => (Number.isFinite(value) ? value : 0);

const formatPercent = (rate: number) => `${(rate * 100).toFixed(0)}%`;

/**
 * The PARF and COE rebate calculator: the four inputs in one card, the
 * estimate as KPI tiles under it, then the rate for every age bracket. Every
 * figure is computed in the browser from fixed rates, so it lands in the
 * static shell with the defaults.
 */
export function PARFCalculator() {
  const [arf, setArf] = useState(80_000);
  const [bracketKey, setBracketKey] = useState("0");
  const [premium, setPremium] = useState(100_000);
  const [monthsLeft, setMonthsLeft] = useState(60);

  const bracket = AGE_BRACKETS[Number(bracketKey)] ?? AGE_BRACKETS[0];
  const result = calculateParf(arf, bracket);
  // LTA pro-rates the COE rebate over the 10-year COE by the months unused.
  const coeRebate = (premium * monthsLeft) / COE_MONTHS;

  const capture = (field: string) =>
    posthog.capture("parf_calculator_used", { bracket: bracket.label, field });
  const selectBracket = (key: string) => {
    posthog.capture("parf_calculator_used", {
      bracket: AGE_BRACKETS[Number(key)]?.label,
      field: "bracket",
    });
    setBracketKey(key);
  };

  const tiles: KpiTile[] = [
    {
      change:
        result.oldRebate > 0
          ? {
              label: "vs before Budget 2026",
              value:
                ((result.newRebate - result.oldRebate) / result.oldRebate) *
                100,
            }
          : undefined,
      format: "currency",
      note: result.newCapped
        ? `capped at ${formatCurrency(NEW_CAP)}`
        : `${formatPercent(bracket.newRate)} of the ARF paid`,
      title: "PARF rebate",
      value: result.newRebate,
    },
    {
      format: "currency",
      note: `${monthsLeft} of ${COE_MONTHS} months unused`,
      title: "COE rebate",
      value: coeRebate,
    },
    {
      format: "currency",
      note: "PARF rebate plus COE rebate",
      title: "Deregistration value",
      value: coeRebate + result.newRebate,
    },
    {
      format: "currency",
      // The $60,000 cap only covers COEs from February 2023, so an older COE
      // would get the uncapped figure.
      note: result.oldCapped
        ? `capped at ${formatCurrency(OLD_CAP)}; ${formatCurrency(result.oldUncapped)} for COEs before Feb 2023`
        : `${formatPercent(bracket.oldRate)} of the ARF paid`,
      title: "PARF rebate before Budget 2026",
      value: result.oldRebate,
    },
  ];

  return (
    <>
      <FigureCard title="Your car">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <NumberField
            formatOptions={SGD_FORMAT}
            fullWidth
            maxValue={1_000_000}
            minValue={0}
            onBlur={() => capture("arf")}
            onChange={(value) => setArf(toNumber(value))}
            value={arf}
          >
            <Label>ARF paid</Label>
            <NumberField.Group>
              <NumberField.Input />
            </NumberField.Group>
            <Description>Find it on your vehicle log card</Description>
          </NumberField>
          <Select
            fullWidth
            onChange={(key) => {
              if (key) selectBracket(String(key));
            }}
            value={bracketKey}
          >
            <Label>Age at deregistration</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {AGE_BRACKETS.map(({ key, label }) => (
                  <ListBox.Item id={key} key={key} textValue={label}>
                    {label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
          <NumberField
            formatOptions={SGD_FORMAT}
            fullWidth
            maxValue={1_000_000}
            minValue={0}
            onBlur={() => capture("coe_premium")}
            onChange={(value) => setPremium(toNumber(value))}
            value={premium}
          >
            <Label>COE premium paid</Label>
            <NumberField.Group>
              <NumberField.Input />
            </NumberField.Group>
          </NumberField>
          <NumberField
            fullWidth
            maxValue={COE_MONTHS}
            minValue={0}
            onBlur={() => capture("months_left")}
            onChange={(value) => setMonthsLeft(toNumber(value))}
            value={monthsLeft}
          >
            <Label>Months left on COE</Label>
            <NumberField.Group>
              <NumberField.Input />
            </NumberField.Group>
          </NumberField>
        </div>
      </FigureCard>

      <div className="flex flex-col gap-4">
        <div aria-live="polite">
          <KpiTiles tiles={tiles} />
        </div>
        <Typography.Paragraph className="max-w-prose" color="muted" size="sm">
          How this is calculated: the PARF rebate is the ARF paid times the rate
          for the car&apos;s age, capped at {formatCurrency(NEW_CAP)} (
          {formatCurrency(OLD_CAP)} before Budget 2026). The COE rebate is the
          COE premium paid times the months left, divided by {COE_MONTHS}.
          Estimates only, not financial advice; check your figures on
          OneMotoring.
        </Typography.Paragraph>
      </div>

      <ParfSchedule
        arf={arf}
        bracketKey={bracketKey}
        onSelect={selectBracket}
      />
    </>
  );
}
