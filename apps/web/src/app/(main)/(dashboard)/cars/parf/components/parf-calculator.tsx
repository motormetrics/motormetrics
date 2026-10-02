"use client";

import { Input, Label, ListBox, Select, Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  AGE_BRACKETS,
  NEW_CAP,
  OLD_CAP,
} from "@web/app/(main)/(dashboard)/cars/parf/components/parf-rates";
import { DeltaChip } from "@web/components/shared/delta-chip";
import {
  ReportEyebrow,
  ReportHeadline,
  ReportSection,
  ReportStat,
} from "@web/components/shared/report";
import posthog from "posthog-js";
import { useMemo, useState } from "react";

/** A COE runs for 10 years; the COE rebate is pro-rated over its months. */
const COE_MONTHS = 120;

/**
 * The calculator strip and the headline it drives.
 *
 * This is a report-family page, so the controls sit in the ruled bar the other
 * detail pages use rather than in a card, and the answer is the oversized
 * headline figure beneath it. The figure is the new rebate — what a reader
 * would actually receive — with the shortfall against the old schedule carried
 * in the delta beside it.
 *
 * The COE premium and months left add the COE rebate, so the section beneath
 * can give the full deregistration value: PARF rebate plus COE rebate.
 */
export function PARFCalculator() {
  const [arfInput, setArfInput] = useState("80000");
  const [bracketKey, setBracketKey] = useState("0");
  const [premiumInput, setPremiumInput] = useState("100000");
  const [monthsInput, setMonthsInput] = useState("60");

  const arf = Number(arfInput.replace(/[^0-9.]/g, "")) || 0;
  const bracket = AGE_BRACKETS[Number(bracketKey)] ?? AGE_BRACKETS[0];
  const premium = Number(premiumInput.replace(/[^0-9.]/g, "")) || 0;
  const monthsLeft = Math.min(
    Number(monthsInput.replace(/[^0-9.]/g, "")) || 0,
    COE_MONTHS,
  );

  const result = useMemo(() => {
    const oldUncapped = arf * bracket.oldRate;
    const newUncapped = arf * bracket.newRate;
    const oldRebate = Math.min(oldUncapped, OLD_CAP);
    const newRebate = Math.min(newUncapped, NEW_CAP);

    return {
      newCapped: newUncapped > NEW_CAP,
      newRebate,
      oldCapped: oldUncapped > OLD_CAP,
      oldRebate,
      oldUncapped,
      shortfall: oldRebate - newRebate,
    };
  }, [arf, bracket]);

  // LTA pro-rates the COE rebate over the 10-year COE by the months unused.
  const coeRebate = (premium * monthsLeft) / COE_MONTHS;

  return (
    <>
      <div className="flex flex-wrap items-end gap-6 border-border border-y py-4">
        <div className="flex flex-col gap-2">
          <ReportEyebrow>ARF paid</ReportEyebrow>
          <Input
            aria-label="ARF paid"
            inputMode="numeric"
            onBlur={() =>
              posthog.capture("parf_calculator_used", {
                bracket: bracket.label,
                field: "arf",
              })
            }
            onChange={(event) => setArfInput(event.target.value)}
            placeholder="e.g. 40,000"
            type="text"
            value={arfInput}
          />
        </div>
        <div className="flex min-w-64 flex-col gap-2">
          <Select
            onChange={(key) => {
              if (!key) return;
              posthog.capture("parf_calculator_used", {
                bracket: AGE_BRACKETS[Number(key)]?.label,
                field: "bracket",
              });
              setBracketKey(String(key));
            }}
            value={bracketKey}
          >
            <Label>
              <ReportEyebrow>Age at deregistration</ReportEyebrow>
            </Label>
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
        </div>
        <div className="flex flex-col gap-2">
          <ReportEyebrow>COE premium paid</ReportEyebrow>
          <Input
            aria-label="COE premium paid"
            inputMode="numeric"
            onBlur={() =>
              posthog.capture("parf_calculator_used", {
                bracket: bracket.label,
                field: "coe_premium",
              })
            }
            onChange={(event) => setPremiumInput(event.target.value)}
            placeholder="e.g. 100,000"
            type="text"
            value={premiumInput}
          />
        </div>
        <div className="flex flex-col gap-2">
          <ReportEyebrow>Months left on COE</ReportEyebrow>
          <Input
            aria-label="Months left on COE"
            inputMode="numeric"
            onBlur={() =>
              posthog.capture("parf_calculator_used", {
                bracket: bracket.label,
                field: "months_left",
              })
            }
            onChange={(event) => setMonthsInput(event.target.value)}
            placeholder="e.g. 60"
            type="text"
            value={monthsInput}
          />
        </div>
      </div>

      <ReportHeadline
        delta={
          result.oldRebate > 0 ? (
            <DeltaChip value={(-result.shortfall / result.oldRebate) * 100} />
          ) : undefined
        }
        label="Rebate after Budget 2026"
        stats={
          <>
            <ReportStat
              label="Before Budget 2026"
              note={
                // The $60,000 cap only covers COEs from February 2023, so an
                // older COE would get the uncapped figure.
                result.oldCapped
                  ? `capped at ${formatCurrency(OLD_CAP)} · ${formatCurrency(result.oldUncapped)} for COEs before Feb 2023`
                  : `${(bracket.oldRate * 100).toFixed(0)}% of ARF`
              }
              value={formatCurrency(result.oldRebate)}
            />
            <ReportStat
              label="Shortfall"
              note="less in your hand"
              value={formatCurrency(result.shortfall)}
            />
            <ReportStat
              label="New rate"
              note={
                result.newCapped
                  ? `capped at ${formatCurrency(NEW_CAP)}`
                  : "of the ARF paid"
              }
              value={`${(bracket.newRate * 100).toFixed(0)}%`}
            />
          </>
        }
        sub={
          bracket.oldRate === 0
            ? "No PARF rebate is given for vehicles over 10 years old, under either schedule."
            : `${formatCurrency(arf)} ARF · ${bracket.label.toLowerCase()} · rebate capped at ${formatCurrency(NEW_CAP)}`
        }
        value={formatCurrency(result.newRebate)}
      />

      {result.shortfall > 0 ? (
        <Typography.Paragraph className="text-muted-strong">
          On these figures the new schedule returns{" "}
          <strong className="text-foreground">
            {formatCurrency(result.shortfall)} less
          </strong>{" "}
          than the old one — {formatCurrency(result.newRebate)} against{" "}
          {formatCurrency(result.oldRebate)}.
        </Typography.Paragraph>
      ) : null}

      <ReportSection
        caption="PARF rebate plus COE rebate"
        title="Deregistration value"
      >
        <ReportHeadline
          label="Deregistration value after Budget 2026"
          stats={
            <>
              <ReportStat
                label="COE rebate"
                note={`${monthsLeft} of ${COE_MONTHS} months unused`}
                value={formatCurrency(coeRebate)}
              />
              <ReportStat
                label="PARF rebate"
                note="after Budget 2026"
                value={formatCurrency(result.newRebate)}
              />
              <ReportStat
                label="Before Budget 2026"
                note="COEs up to the 1st February 2026 exercise"
                value={formatCurrency(coeRebate + result.oldRebate)}
              />
            </>
          }
          sub={`${formatCurrency(premium)} COE premium × ${monthsLeft} ÷ ${COE_MONTHS} months, plus the PARF rebate above`}
          value={formatCurrency(coeRebate + result.newRebate)}
        />
      </ReportSection>
    </>
  );
}
