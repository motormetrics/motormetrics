"use client";

import { cn, Tabs, Typography } from "@heroui/react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

const CALCULATORS = [
  { href: "/cars/arf", id: "arf", label: "ARF" },
  { href: "/cars/parf", id: "parf", label: "PARF rebate" },
] as const;

/**
 * The switch between the two calculators. Each keeps its own address, so the
 * tabs are links and the selected one is whichever page rendered it.
 */
export function CalculatorTabs({ current }: { current: "arf" | "parf" }) {
  return (
    <Tabs className="w-fit max-w-full" selectedKey={current}>
      <Tabs.ListContainer>
        <Tabs.List aria-label="Calculator">
          {CALCULATORS.map(({ href, id, label }) => (
            <Tabs.Tab
              // The comp fills the selected tab with the accent; the default
              // indicator is the surface colour.
              className="whitespace-nowrap data-[selected=true]:text-accent-foreground"
              href={href}
              id={id}
              key={id}
              render={(domProps) => (
                // Every tab here has an href, so React Aria always passes
                // anchor props; the render type only allows for a div too.
                <Link {...(domProps as ComponentProps<"a">)} href={href} />
              )}
            >
              {label}
              <Tabs.Indicator className="bg-accent" />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  );
}

/** One of the result's key figures; the first is drawn largest. */
export interface CalculatorFigure {
  label: string;
  note: ReactNode;
  value: string;
}

/** One line of the breakdown under the key figures. */
export interface CalculatorRow {
  amount: string;
  /** Bar length, 0 to 1 of the longest bar. */
  fraction: number;
  /** The rows the result is made of are bold, with a full-colour bar. */
  isActive: boolean;
  label: string;
  rate: string;
}

/** Shared by the breakdown's header and rows, so the columns line up. */
const BREAKDOWN_ROW = "flex flex-wrap items-center gap-x-4 gap-y-2";
const LABEL_CELL = "w-48 shrink-0 max-md:w-auto max-md:min-w-0 max-md:flex-1";
const RATE_CELL = "w-12 shrink-0 text-right";
const BAR_CELL = "min-w-0 flex-1 max-md:order-last max-md:basis-full";
const AMOUNT_CELL = "w-24 shrink-0 text-right";

/**
 * The layout both calculators share: the inputs under "Your car" on the left
 * and the result on the right, as key figures, a breakdown with one
 * proportional bar per line, and the note saying how it was worked out.
 */
export function CalculatorPanel({
  amountHeading,
  children,
  figures,
  labelHeading,
  note,
  rows,
}: {
  amountHeading: string;
  /** The input fields. */
  children: ReactNode;
  figures: CalculatorFigure[];
  labelHeading: string;
  note: ReactNode;
  rows: CalculatorRow[];
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-3 xl:gap-16">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Typography.Heading className="text-base" level={2} weight="bold">
          Your car
        </Typography.Heading>
        {children}
      </div>

      <div
        aria-live="polite"
        className="flex min-w-0 flex-col gap-6 xl:col-span-2"
      >
        <dl
          className={cn(
            "grid grid-cols-1 gap-x-6 gap-y-4",
            figures.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2",
          )}
        >
          {figures.map(({ label, note: figureNote, value }, index) => (
            <div className="flex min-w-0 flex-col gap-1" key={label}>
              <dt className="font-semibold text-sm">{label}</dt>
              <dd
                className={cn(
                  "tabular-nums leading-none tracking-tight",
                  index === 0
                    ? "font-extrabold text-4xl"
                    : "font-bold text-2xl",
                )}
              >
                {value}
              </dd>
              <dd className="text-muted text-sm tabular-nums">{figureNote}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-col text-sm tabular-nums">
          <div
            className={cn(
              BREAKDOWN_ROW,
              "border-separator border-b pb-2 text-muted",
            )}
          >
            <span className={LABEL_CELL}>{labelHeading}</span>
            <span className={RATE_CELL}>Rate</span>
            <span className={cn(BAR_CELL, "max-md:hidden")} />
            <span className={AMOUNT_CELL}>{amountHeading}</span>
          </div>
          {rows.map(({ amount, fraction, isActive, label, rate }) => (
            <div
              className={cn(BREAKDOWN_ROW, "border-separator border-b py-2")}
              key={label}
            >
              <span className={cn(LABEL_CELL, isActive && "font-bold")}>
                {label}
              </span>
              <span className={cn(RATE_CELL, isActive && "font-bold")}>
                {rate}
              </span>
              <span
                aria-hidden
                className={cn(BAR_CELL, fraction === 0 && "max-md:hidden")}
              >
                <span
                  className={cn(
                    "block h-2 rounded-full",
                    isActive ? "bg-accent" : "bg-accent/30",
                  )}
                  style={{ width: `${(fraction * 100).toFixed(1)}%` }}
                />
              </span>
              <span className={cn(AMOUNT_CELL, "font-semibold")}>{amount}</span>
            </div>
          ))}
        </div>

        <Typography.Paragraph className="max-w-prose" color="muted" size="sm">
          {note}
        </Typography.Paragraph>
      </div>
    </div>
  );
}
