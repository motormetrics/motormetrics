"use client";

import { cn } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { LegendItem } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-comparison";
import {
  AGE_BRACKETS,
  NEW_CAP,
  OLD_CAP,
  uniformRateCut,
} from "@web/app/(main)/(dashboard)/cars/parf/components/parf-rates";
import { SectionHead, SourceNote } from "@web/components/shared/overview";

/** Shared by the schedule header and rows, so the columns line up. */
const SCHEDULE_ROW = "flex items-center gap-4 px-3 max-md:gap-2 max-md:px-1.5";
const RATE_CELL = "w-20 shrink-0 text-right max-md:w-14";
const CHANGE_CELL = "w-24 shrink-0 text-right max-md:hidden";
const BARS_CELL = "w-48 shrink-0 max-lg:hidden";
const REBATE_CELL = "w-28 shrink-0 text-right max-md:w-20";
/** The bars' scale: the highest rate either schedule pays. */
const TOP_RATE = Math.max(...AGE_BRACKETS.map(({ oldRate }) => oldRate));

const formatPercent = (rate: number) => `${(rate * 100).toFixed(0)}%`;

/** "Every bracket up to 10 years drops 45 percentage points, …". */
function scheduleCaption(): string {
  const cut = uniformRateCut(AGE_BRACKETS);
  const drop =
    cut === null
      ? "Every bracket up to 10 years pays a lower rate"
      : `Every bracket up to 10 years drops ${cut} percentage points`;
  return `${drop}, and the rebate cap falls from ${formatCurrency(OLD_CAP)} to ${formatCurrency(NEW_CAP)}. Select a row to use that age.`;
}

/**
 * Figure 2: the rate for every age bracket under both schedules, with the
 * rebate the entered ARF earns in each. A row is a button that sets the age.
 */
export function ParfSchedule({
  arf,
  bracketKey,
  onSelect,
}: {
  arf: number;
  bracketKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <section className="flex scroll-mt-20 flex-col gap-4" id="parf-rates">
      <SectionHead
        caption={scheduleCaption()}
        eyebrow="Figure 2 · Rate schedule"
        title="Rebate rates by vehicle age"
        trailing={
          <span className="flex gap-4 max-lg:hidden">
            <LegendItem className="bg-chart-4" label="Old rate" />
            <LegendItem className="bg-chart-3" label="New rate" />
          </span>
        }
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
          <span className={BARS_CELL}>
            Before and after, 0 to {formatPercent(TOP_RATE)}
          </span>
          <span className={REBATE_CELL}>Your rebate</span>
        </div>
        {AGE_BRACKETS.map(({ key, label, newRate, oldRate }) => {
          const isActive = key === bracketKey;
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
              onClick={() => onSelect(key)}
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
                {formatPercent(oldRate)}
              </span>
              <span
                className={cn(
                  RATE_CELL,
                  "font-semibold text-base tabular-nums",
                )}
              >
                {formatPercent(newRate)}
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
        Source: LTA · Rates apply to the ARF paid on the vehicle, and the rebate
        is capped whichever bracket it falls in. Under the old schedule, the{" "}
        {formatCurrency(OLD_CAP)} cap covers COEs from the 2nd February 2023
        exercise onwards; COEs obtained before that have no cap. “Your rebate”
        uses the new schedule and the ARF entered above.
      </SourceNote>
    </section>
  );
}
