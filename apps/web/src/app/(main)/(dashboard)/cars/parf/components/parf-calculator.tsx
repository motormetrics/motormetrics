"use client";

import { Label, ListBox, NumberField, Select } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { CalculatorPanel } from "@web/app/(main)/(dashboard)/cars/parf/components/calculator-panel";
import { DeregistrationValue } from "@web/app/(main)/(dashboard)/cars/parf/components/deregistration-value";
import { ParfComparison } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-comparison";
import {
  AGE_BRACKETS,
  calculateParf,
  NEW_CAP,
  OLD_CAP,
  SGD_FORMAT,
} from "@web/app/(main)/(dashboard)/cars/parf/components/parf-rates";
import { ParfSchedule } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-schedule";
import { Hairline } from "@web/components/shared/overview";
import posthog from "posthog-js";
import { useState } from "react";

const formatPercent = (rate: number) => `${(rate * 100).toFixed(0)}%`;

/**
 * The PARF calculator: the two fields the rebate needs under "Your car", and
 * beside them the estimate, the rebate the entered ARF earns at every age, and
 * the note. The figures beneath read the same state, so they live here too;
 * everything is client-rendered from fixed rates and lands in the static
 * shell with the defaults.
 */
export function PARFCalculator() {
  const [arf, setArf] = useState(80_000);
  const [bracketKey, setBracketKey] = useState("0");

  const bracket = AGE_BRACKETS[Number(bracketKey)] ?? AGE_BRACKETS[0];
  const result = calculateParf(arf, bracket);

  const selectBracket = (key: string) => {
    posthog.capture("parf_calculator_used", {
      bracket: AGE_BRACKETS[Number(key)]?.label,
      field: "bracket",
    });
    setBracketKey(key);
  };

  const figures = [
    {
      label: "PARF rebate",
      value: formatCurrency(result.newRebate),
      note:
        bracket.oldRate === 0
          ? "No PARF rebate is given for vehicles over 10 years old, under either schedule."
          : result.newCapped
            ? `capped at ${formatCurrency(NEW_CAP)}`
            : `${formatPercent(bracket.newRate)} of the ARF paid`,
    },
    {
      label: "PARF rebate before Budget 2026",
      value: formatCurrency(result.oldRebate),
      // The $60,000 cap only covers COEs from February 2023, so an older COE
      // would get the uncapped figure.
      note: result.oldCapped
        ? `capped at ${formatCurrency(OLD_CAP)} · ${formatCurrency(result.oldUncapped)} for COEs before Feb 2023`
        : `${formatPercent(bracket.oldRate)} of the ARF paid`,
    },
  ];

  // Bars are scaled to the youngest bracket, which pays the highest rate.
  const largestRebate = Math.max(
    Math.min(arf * AGE_BRACKETS[0].newRate, NEW_CAP),
    1,
  );
  const rows = AGE_BRACKETS.map(({ key, label, newRate }) => {
    const rebate = Math.min(arf * newRate, NEW_CAP);
    return {
      amount: formatCurrency(rebate),
      fraction: rebate / largestRebate,
      isActive: key === bracket.key,
      label,
      rate: formatPercent(newRate),
    };
  });

  return (
    <>
      <CalculatorPanel
        amountHeading="PARF rebate"
        figures={figures}
        labelHeading="Age at deregistration"
        note={`How this is calculated: the PARF rebate is the ARF paid times the rate for the car's age, capped at ${formatCurrency(NEW_CAP)} (${formatCurrency(OLD_CAP)} before Budget 2026). Estimates only, not financial advice; check your figures on OneMotoring.`}
        rows={rows}
      >
        <NumberField
          formatOptions={SGD_FORMAT}
          fullWidth
          maxValue={1_000_000}
          minValue={0}
          onBlur={() =>
            posthog.capture("parf_calculator_used", {
              bracket: bracket.label,
              field: "arf",
            })
          }
          onChange={(value) => setArf(Number.isFinite(value) ? value : 0)}
          value={arf}
        >
          <Label>ARF paid</Label>
          <NumberField.Group>
            <NumberField.Input />
          </NumberField.Group>
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
      </CalculatorPanel>

      <Hairline />
      <ParfComparison arf={arf} bracket={bracket} result={result} />
      <Hairline />
      <ParfSchedule
        arf={arf}
        bracketKey={bracketKey}
        onSelect={selectBracket}
      />
      <Hairline />
      <DeregistrationValue bracketLabel={bracket.label} result={result} />
    </>
  );
}
