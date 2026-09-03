"use client";

import { Input, Label, ListBox, Select, Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils";
import {
  AGE_BRACKETS,
  NEW_CAP,
  OLD_CAP,
} from "@web/app/(main)/(dashboard)/cars/parf/components/parf-rates";
import { DeltaChip } from "@web/components/shared/delta-chip";
import {
  ReportEyebrow,
  ReportHeadline,
  ReportStat,
} from "@web/components/shared/report";
import posthog from "posthog-js";
import { useMemo, useState } from "react";

/**
 * The calculator strip and the headline it drives.
 *
 * This is a report-family page, so the controls sit in the ruled bar the other
 * detail pages use rather than in a card, and the answer is the oversized
 * headline figure beneath it. The figure is the new rebate — what a reader
 * would actually receive — with the shortfall against the old schedule carried
 * in the delta beside it.
 */
export function PARFCalculator() {
  const [arfInput, setArfInput] = useState("80000");
  const [bracketKey, setBracketKey] = useState("0");

  const arf = Number(arfInput.replace(/[^0-9.]/g, "")) || 0;
  const bracket = AGE_BRACKETS[Number(bracketKey)] ?? AGE_BRACKETS[0];

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
      shortfall: oldRebate - newRebate,
    };
  }, [arf, bracket]);

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
                result.oldCapped
                  ? `capped at ${formatCurrency(OLD_CAP)}`
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
    </>
  );
}
