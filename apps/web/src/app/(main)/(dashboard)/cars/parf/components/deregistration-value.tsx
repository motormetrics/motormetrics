"use client";

import { Label, NumberField } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  type ParfResult,
  SGD_FORMAT,
} from "@web/app/(main)/(dashboard)/cars/parf/components/parf-rates";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import posthog from "posthog-js";
import { useState } from "react";

/** A COE runs for 10 years; the COE rebate is pro-rated over its months. */
const COE_MONTHS = 120;

const toNumber = (value: number) => (Number.isFinite(value) ? value : 0);

/**
 * Figure 3: the PARF rebate plus the COE rebate for the months left on the
 * COE. It asks for the two COE inputs itself, so the calculator in the head
 * stays on the two the PARF rebate needs.
 */
export function DeregistrationValue({
  bracketLabel,
  result,
}: {
  bracketLabel: string;
  result: ParfResult;
}) {
  const [premium, setPremium] = useState(100_000);
  const [monthsLeft, setMonthsLeft] = useState(60);

  // LTA pro-rates the COE rebate over the 10-year COE by the months unused.
  const coeRebate = (premium * monthsLeft) / COE_MONTHS;
  const capture = (field: string) =>
    posthog.capture("parf_calculator_used", { bracket: bracketLabel, field });

  const stats = [
    {
      label: "COE rebate",
      note: `${monthsLeft} of ${COE_MONTHS} months unused`,
      value: formatCurrency(coeRebate),
    },
    {
      label: "PARF rebate",
      note: "after Budget 2026",
      value: formatCurrency(result.newRebate),
    },
    {
      label: "Before Budget 2026",
      note: "COEs up to the 1st February 2026 exercise",
      value: formatCurrency(coeRebate + result.oldRebate),
    },
    {
      label: "Difference",
      note: "less under the new schedule",
      value: formatCurrency(result.shortfall),
    },
  ];

  return (
    <section className="flex scroll-mt-20 flex-col gap-4" id="parf-dereg">
      <SectionHead
        caption={`PARF rebate of ${formatCurrency(result.newRebate)} plus a COE rebate of ${formatCurrency(coeRebate)} for ${monthsLeft} of ${COE_MONTHS} months unused.`}
        eyebrow="Figure 3 · When you deregister"
        title="Deregistration value"
      />
      <div className="flex flex-wrap items-end gap-4 border-border border-t border-b border-b-separator py-4">
        <NumberField
          className="w-60 max-md:w-full"
          formatOptions={SGD_FORMAT}
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
          className="w-44 max-md:w-full"
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
      <div className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-14">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-muted-strong text-sm">
            <span className="font-semibold text-foreground">
              Estimated deregistration value
            </span>{" "}
            · after Budget 2026
          </span>
          <span
            aria-live="polite"
            className="font-extrabold text-4xl tabular-nums leading-none tracking-tight md:text-5xl"
          >
            {formatCurrency(coeRebate + result.newRebate)}
          </span>
          <SourceNote className="tabular-nums">
            {formatCurrency(premium)} COE premium × {monthsLeft} ÷ {COE_MONTHS}{" "}
            months, plus the PARF rebate above
          </SourceNote>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 border-separator border-t">
          {stats.map(({ label, note, value }) => (
            <div
              className="flex flex-col gap-0.5 border-separator border-b py-3"
              key={label}
            >
              <dt className="font-semibold text-muted text-xs">{label}</dt>
              <dd className="font-semibold text-xl tabular-nums">{value}</dd>
              <dd className="text-muted text-xs tabular-nums">{note}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
