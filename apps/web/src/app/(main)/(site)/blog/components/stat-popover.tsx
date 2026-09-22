"use client";

import { Button, Popover } from "@heroui/react";
import { ChartNoAxesColumn } from "lucide-react";

export interface StatRow {
  label: string;
  value: string;
}

export interface QuickStat {
  /** What the figures are, e.g. "Latest COE premiums". */
  heading: string;
  /** When they are from, e.g. "Sep 2026 · 2nd bidding". */
  period: string;
  rows: StatRow[];
}

/**
 * A glance at the live figures behind a "Follow the figures" link, so the
 * reader can check the latest number without leaving the post.
 */
export function StatPopover({
  label,
  stat,
}: {
  label: string;
  stat: QuickStat;
}) {
  return (
    <Popover>
      <Button
        aria-label={`Latest ${label.toLowerCase()} figures`}
        className="size-7 min-w-0 rounded-full bg-accent-foreground/10 text-accent-on-dark hover:bg-accent-foreground/20"
        isIconOnly
        size="sm"
        variant="tertiary"
      >
        <ChartNoAxesColumn className="size-4" />
      </Button>
      <Popover.Content className="w-72 rounded-2xl" placement="bottom end">
        <Popover.Dialog>
          <Popover.Heading className="font-bold text-foreground">
            {stat.heading}
          </Popover.Heading>
          <p className="mt-0.5 text-muted text-xs">{stat.period}</p>
          <dl className="mt-3 flex flex-col gap-2">
            {stat.rows.map((row) => (
              <div
                className="flex items-baseline justify-between gap-4 text-sm"
                key={row.label}
              >
                <dt className="text-muted">{row.label}</dt>
                <dd className="font-semibold tabular-nums">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
