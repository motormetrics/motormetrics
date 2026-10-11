"use client";

import { Input, Label, ListBox, Select, Typography } from "@heroui/react";
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
import {
  ReportHeadline,
  ReportSection,
  ReportStat,
} from "@web/components/shared/report";
import { Text } from "@web/components/shared/text";
import { compactCurrency } from "@web/utils/formatting/chart-axis";
import posthog from "posthog-js";
import { useMemo, useState } from "react";

/** A COE runs for 10 years; the COE rebate is pro-rated over its months. */
const COE_MONTHS = 120;

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
      color: "var(--chart-3)",
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
            fill="var(--chart-3)"
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
