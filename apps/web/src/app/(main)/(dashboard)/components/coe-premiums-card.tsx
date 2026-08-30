"use client";

import { Tooltip, Typography } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { NumberValue } from "@heroui-pro/react";
import { ArrowUpRight, Calculator } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CostTrendChip } from "./cost-trend-chip";

export interface CoeCategorySeries {
  category: string;
  label: string;
  points: { month: string; premium: number }[];
}

const CHART_WIDTH = 560;
const CHART_HEIGHT = 170;
const CHART_PAD = 12;

function areaPath(values: number[]) {
  if (values.length < 2) {
    return null;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => [
    (index / (values.length - 1)) * (CHART_WIDTH - CHART_PAD * 2) + CHART_PAD,
    CHART_HEIGHT -
      CHART_PAD -
      ((value - min) / span) * (CHART_HEIGHT - CHART_PAD * 2),
  ]);

  const line = points
    .map(
      ([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`,
    )
    .join(" ");
  const [lastX, lastY] = points.at(-1) ?? [0, 0];

  return {
    line,
    area: `${line} L${CHART_WIDTH - CHART_PAD} ${CHART_HEIGHT} L${CHART_PAD} ${CHART_HEIGHT} Z`,
    lastX: lastX.toFixed(1),
    lastY: lastY.toFixed(1),
  };
}

const formatMonth = (month: string) => {
  const [year, monthPart] = month.split("-");
  return new Date(Number(year), Number(monthPart) - 1).toLocaleString("en-SG", {
    month: "short",
    year: "numeric",
  });
};

export function CoePremiumsCard({ series }: { series: CoeCategorySeries[] }) {
  const [selected, setSelected] = useState(series[0]?.category ?? "");
  const active = series.find((item) => item.category === selected) ?? series[0];

  if (!active) {
    return null;
  }

  const values = active.points.map((point) => point.premium);
  const chart = areaPath(values);
  const current = values.at(-1) ?? 0;
  const previous = values.at(-2) ?? current;
  const changeRatio = previous > 0 ? (current - previous) / previous : 0;

  return (
    <div className="flex flex-col gap-6 rounded-4xl bg-surface p-8 shadow-surface">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Calculator className="size-6" />
        </span>
        <div className="flex flex-col">
          <Typography.Heading level={3}>COE premiums</Typography.Heading>
          <Typography.Paragraph color="muted" size="sm">
            Latest bidding exercise
          </Typography.Paragraph>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {series.map((item) => {
            const isActive = item.category === active.category;
            return (
              <button
                aria-pressed={isActive}
                className={`size-11 rounded-full font-extrabold text-base transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "bg-default text-muted hover:bg-accent/15"
                }`}
                key={item.category}
                onClick={() => setSelected(item.category)}
                type="button"
              >
                {item.label}
              </button>
            );
          })}
          <Tooltip delay={300}>
            <Link
              aria-label="View all COE results"
              className={buttonVariants({
                className: "size-11 rounded-full",
                isIconOnly: true,
                variant: "tertiary",
              })}
              href="/coe"
            >
              <ArrowUpRight className="size-6" />
            </Link>
            <Tooltip.Content>View all COE results</Tooltip.Content>
          </Tooltip>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-extrabold text-5xl tabular-nums tracking-tight">
            <NumberValue
              currency="SGD"
              locale="en-SG"
              maximumFractionDigits={0}
              style="currency"
              value={current}
            />
          </span>
          <CostTrendChip changeRatio={changeRatio} />
        </div>
        <Typography.Paragraph color="muted" size="sm">
          {active.category}
        </Typography.Paragraph>
      </div>

      {chart ? (
        <div className="flex flex-col gap-2">
          <svg
            className="h-[170px] w-full overflow-visible"
            preserveAspectRatio="none"
            role="img"
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          >
            <title>{`${active.category} premiums over the last 12 months`}</title>
            <path d={chart.area} fill="var(--accent)" opacity={0.12} />
            <path
              d={chart.line}
              fill="none"
              stroke="var(--accent)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3.5}
            />
            <circle
              cx={chart.lastX}
              cy={chart.lastY}
              fill="var(--surface)"
              r={6.5}
              stroke="var(--accent)"
              strokeWidth={3.5}
            />
          </svg>
          <div className="flex justify-between">
            <Typography.Paragraph color="muted" size="xs">
              {formatMonth(active.points[0]?.month ?? "")}
            </Typography.Paragraph>
            <Typography.Paragraph color="muted" size="xs">
              {formatMonth(active.points.at(-1)?.month ?? "")}
            </Typography.Paragraph>
          </div>
        </div>
      ) : null}
    </div>
  );
}
