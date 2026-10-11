"use client";

import { cn, Input, Label, ListBox, Select, Typography } from "@heroui/react";
import { ChartTooltip } from "@heroui-pro/react";
import { BarChart } from "@heroui-pro/react/bar-chart";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  AGE_BRACKETS,
  NEW_CAP,
  OLD_CAP,
} from "@web/app/(main)/(dashboard)/cars/parf/components/parf-rates";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import {
  Hairline,
  SectionHead,
  SourceNote,
  StatCell,
} from "@web/components/shared/overview";
import { Text } from "@web/components/shared/text";
import { compactCurrency } from "@web/utils/formatting/chart-axis";
import posthog from "posthog-js";
import { useMemo, useState } from "react";

/** A COE runs for 10 years; the COE rebate is pro-rated over its months. */
const COE_MONTHS = 120;

/** Shared by the schedule header and rows, so the columns line up. */
const SCHEDULE_ROW = "flex items-center gap-4 px-3 max-md:gap-2 max-md:px-1.5";
const RATE_CELL = "w-20 shrink-0 text-right max-md:w-14";
const CHANGE_CELL = "w-24 shrink-0 text-right max-md:hidden";
const BARS_CELL = "w-48 shrink-0 max-lg:hidden";
const REBATE_CELL = "w-28 shrink-0 text-right max-md:w-20";
/** The bars' scale: the highest rate either schedule pays. */
const TOP_RATE = 0.75;

/** One bar of the old-against-new comparison. */
interface CompareRow {
  [key: string]: number | string;
  after: number;
  before: number;
  color: string;
  label: string;
  value: number;
}

/** "−60.0%", with a true minus for a fall. */
const formatSignedPercent = (ratio: number): string =>
  `${ratio < 0 ? "−" : "+"}${Math.abs(ratio * 100).toFixed(1)}%`;

/**
 * The small label above each calculator field. A span rather than
 * `Typography.Paragraph`: inside the `Select` that renders react-aria's `Text`,
 * which demands a slot.
 */
function FieldLabel({ children }: { children: string }) {
  return <span className="font-semibold text-muted text-xs">{children}</span>;
}

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

  const selectBracket = (key: string) => {
    posthog.capture("parf_calculator_used", {
      bracket: AGE_BRACKETS[Number(key)]?.label,
      field: "bracket",
    });
    setBracketKey(key);
  };

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

  // Each row fills one series, so the two bars take different colours.
  const compareRows: CompareRow[] = [
    {
      after: 0,
      before: result.oldRebate,
      color: "var(--chart-4)",
      label: "Before Budget 2026",
      value: result.oldRebate,
    },
    {
      after: result.newRebate,
      before: 0,
      color: "var(--chart-1)",
      label: "After Budget 2026",
      value: result.newRebate,
    },
  ];
  const compareTicks = axisTicks([result.oldRebate, result.newRebate, 1], {
    zero: true,
  });

  // LTA pro-rates the COE rebate over the 10-year COE by the months unused.
  const coeRebate = (premium * monthsLeft) / COE_MONTHS;

  return (
    <>
      <div className="flex flex-wrap items-end gap-5 border-border border-t border-b border-b-separator py-5 max-md:flex-col max-md:items-stretch">
        <div className="flex w-60 flex-col gap-2 max-md:w-full">
          <FieldLabel>ARF paid</FieldLabel>
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
        <div className="flex w-72 flex-col gap-2 max-md:w-full">
          <Select
            onChange={(key) => {
              if (key) selectBracket(String(key));
            }}
            value={bracketKey}
          >
            <Label>
              <FieldLabel>Age at deregistration</FieldLabel>
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
        <div className="flex w-52 flex-col gap-2 max-md:w-full">
          <FieldLabel>COE premium paid</FieldLabel>
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
        <div className="flex w-44 flex-col gap-2 max-md:w-full">
          <FieldLabel>Months left on COE</FieldLabel>
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

      <div className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-14">
        <div className="flex min-w-0 flex-col gap-3">
          <Text.Paragraph tone="strong">
            <span className="font-semibold text-accent-strong">
              Rebate after Budget 2026
            </span>
            {` · ${bracket.label}`}
          </Text.Paragraph>
          <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight md:text-6xl">
            {formatCurrency(result.newRebate)}
          </span>
          {bracket.oldRate === 0 ? (
            <Typography.Paragraph color="muted">
              No PARF rebate is given for vehicles over 10 years old, under
              either schedule.
            </Typography.Paragraph>
          ) : result.oldRebate > 0 ? (
            <Typography.Paragraph className="tabular-nums" color="muted">
              <span className="font-semibold text-foreground">
                {formatSignedPercent(
                  (result.newRebate - result.oldRebate) / result.oldRebate,
                )}
              </span>{" "}
              (−{formatCurrency(result.shortfall)}) vs{" "}
              {formatCurrency(result.oldRebate)} under the old schedule
            </Typography.Paragraph>
          ) : null}
          <SourceNote className="tabular-nums">
            {formatCurrency(arf)} ARF · {bracket.label} · rebate capped at{" "}
            {formatCurrency(NEW_CAP)}
          </SourceNote>
        </div>

        <div className="grid grid-cols-2 border-separator border-t">
          <StatCell
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
          <StatCell
            label="Shortfall"
            note="less in your hand"
            value={formatCurrency(result.shortfall)}
          />
          <StatCell
            label="New rate"
            note={
              result.newCapped
                ? `capped at ${formatCurrency(NEW_CAP)}`
                : "of the ARF paid"
            }
            value={`${(bracket.newRate * 100).toFixed(0)}%`}
          />
          <StatCell
            label="Rebate cap"
            note={`was ${formatCurrency(OLD_CAP)}`}
            value={formatCurrency(NEW_CAP)}
          />
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <SectionHead
          caption={`${formatCurrency(arf)} ARF · ${bracket.label}`}
          eyebrow="Old and new schedules"
          title="What this deregistration returns"
        />
        <BarChart
          data={compareRows}
          height={compareRows.length * 56 + 28}
          layout="vertical"
          margin={{ bottom: 0, left: 0, right: 16, top: 0 }}
        >
          <BarChart.Grid horizontal={false} />
          <BarChart.XAxis
            domain={[0, compareTicks.at(-1) ?? "auto"]}
            tickFormatter={compactCurrency}
            ticks={compareTicks}
            type="number"
          />
          <BarChart.YAxis
            dataKey="label"
            tickMargin={8}
            type="category"
            width={160}
          />
          <BarChart.Bar
            barSize={18}
            dataKey="before"
            fill="var(--chart-4)"
            radius={[0, 2, 2, 0]}
            stackId="rebate"
          />
          <BarChart.Bar
            barSize={18}
            dataKey="after"
            fill="var(--chart-1)"
            radius={[0, 2, 2, 0]}
            stackId="rebate"
          />
          <BarChart.Tooltip
            content={({ active, payload }) => {
              const row = payload?.[0]?.payload as CompareRow | undefined;
              if (!active || !row) {
                return null;
              }
              return (
                <ChartTooltip>
                  <ChartTooltip.Header>{row.label}</ChartTooltip.Header>
                  <ChartTooltip.Item>
                    <ChartTooltip.Indicator color={row.color} />
                    <ChartTooltip.Label>PARF rebate</ChartTooltip.Label>
                    <ChartTooltip.Value>
                      {formatCurrency(row.value)}
                    </ChartTooltip.Value>
                  </ChartTooltip.Item>
                </ChartTooltip>
              );
            }}
          />
        </BarChart>
        <SourceNote>
          Bars start at $0 on a shared scale.{" "}
          {bracket.oldRate === 0
            ? "Neither schedule pays a rebate past 10 years."
            : `On these figures the new schedule returns ${formatCurrency(result.shortfall)} less than the old one: ${formatCurrency(result.newRebate)} against ${formatCurrency(result.oldRebate)}.`}
        </SourceNote>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead
          caption="PARF rebate plus COE rebate"
          eyebrow="When you deregister"
          title="Deregistration value"
        />
        <div className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-14">
          <div className="flex min-w-0 flex-col gap-3">
            <Text.Paragraph tone="strong">
              <span className="font-semibold text-accent-strong">
                Deregistration value
              </span>{" "}
              · after Budget 2026
            </Text.Paragraph>
            <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight">
              {formatCurrency(coeRebate + result.newRebate)}
            </span>
            <SourceNote className="tabular-nums">
              {formatCurrency(premium)} COE premium × {monthsLeft} ÷{" "}
              {COE_MONTHS} months, plus the PARF rebate above
            </SourceNote>
          </div>
          <div className="grid grid-cols-2 border-separator border-t">
            <StatCell
              label="COE rebate"
              note={`${monthsLeft} of ${COE_MONTHS} months unused`}
              value={formatCurrency(coeRebate)}
            />
            <StatCell
              label="PARF rebate"
              note="after Budget 2026"
              value={formatCurrency(result.newRebate)}
            />
            <StatCell
              label="Before Budget 2026"
              note="COEs up to the 1st February 2026 exercise"
              value={formatCurrency(coeRebate + result.oldRebate)}
            />
            <StatCell
              label="Difference"
              note="less under the new schedule"
              value={formatCurrency(result.shortfall)}
            />
          </div>
        </div>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead
          caption={`Rebate cap ${formatCurrency(OLD_CAP)} → ${formatCurrency(NEW_CAP)} · select a row to use that age`}
          eyebrow="Rate schedule"
          title="Rebate rates by vehicle age"
        />
        <div className="flex flex-col">
          <div
            className={cn(
              SCHEDULE_ROW,
              "items-end border-border border-b pb-2.5 font-semibold text-muted text-xs",
            )}
          >
            <span className="min-w-0 flex-1">Vehicle age</span>
            <span className={RATE_CELL}>Before</span>
            <span className={RATE_CELL}>After</span>
            <span className={CHANGE_CELL}>Change</span>
            <span className={BARS_CELL}>Before and after, 0 to 75%</span>
            <span className={REBATE_CELL}>Your rebate</span>
          </div>
          {AGE_BRACKETS.map(({ key, label, newRate, oldRate }) => {
            const isActive = key === bracket.key;
            const change = (newRate - oldRate) * 100;
            return (
              <button
                aria-label={`Use ${label}`}
                aria-pressed={isActive}
                className={cn(
                  SCHEDULE_ROW,
                  "w-full cursor-pointer border-separator border-b border-l-2 py-3 text-left transition-colors hover:bg-surface-secondary",
                  isActive
                    ? "border-l-accent bg-accent-soft"
                    : "border-l-transparent",
                )}
                key={key}
                onClick={() => selectBracket(key)}
                type="button"
              >
                <span
                  className={cn(
                    "min-w-0 flex-1 text-sm",
                    isActive
                      ? "font-bold text-accent-strong"
                      : "font-medium text-foreground",
                  )}
                >
                  {label}
                </span>
                <span
                  className={cn(RATE_CELL, "text-muted text-sm tabular-nums")}
                >
                  {(oldRate * 100).toFixed(0)}%
                </span>
                <span
                  className={cn(
                    RATE_CELL,
                    "font-semibold text-base tabular-nums",
                  )}
                >
                  {(newRate * 100).toFixed(0)}%
                </span>
                <span
                  className={cn(
                    CHANGE_CELL,
                    "text-muted-strong text-sm tabular-nums",
                  )}
                >
                  {change === 0
                    ? "No change"
                    : `${change < 0 ? "−" : "+"}${Math.abs(change).toFixed(1)}pp`}
                </span>
                <span className={cn(BARS_CELL, "flex flex-col gap-1")}>
                  <span className="block h-1.5 bg-surface-secondary">
                    <span
                      className="block h-full bg-chart-4"
                      style={{
                        width: `${((oldRate / TOP_RATE) * 100).toFixed(1)}%`,
                      }}
                    />
                  </span>
                  <span className="block h-1.5 bg-surface-secondary">
                    <span
                      className={cn(
                        "block h-full",
                        isActive ? "bg-chart-1" : "bg-chart-3",
                      )}
                      style={{
                        width: `${((newRate / TOP_RATE) * 100).toFixed(1)}%`,
                      }}
                    />
                  </span>
                </span>
                <span
                  className={cn(
                    REBATE_CELL,
                    "font-semibold text-accent-strong text-sm tabular-nums",
                  )}
                >
                  {formatCurrency(Math.min(arf * newRate, NEW_CAP))}
                </span>
              </button>
            );
          })}
        </div>
        <SourceNote>
          Rates apply to the ARF paid on the vehicle, and the rebate is capped
          whichever bracket it falls in. Under the old schedule, the{" "}
          {formatCurrency(OLD_CAP)} cap covers COEs from the 2nd February 2023
          exercise onwards; COEs obtained before that have no cap. “Your rebate”
          uses the new schedule and the ARF entered above.{" "}
          <span className="max-lg:hidden">
            In the bars, light is the old rate and dark is the new one.
          </span>
          <span className="md:hidden">
            Change is 45 percentage points in every bracket up to 10 years.
          </span>
        </SourceNote>
      </section>
    </>
  );
}
