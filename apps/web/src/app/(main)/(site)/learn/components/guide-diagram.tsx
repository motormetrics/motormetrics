"use client";

import { Typography } from "@heroui/react";
import {
  fadeInVariants,
  growAcrossVariants,
  growUpVariants,
} from "@web/config/animations";
import { MotionConfig } from "motion/react";
import * as motion from "motion/react-client";

const WIDTH = 240;
const HEIGHT = 48;
const GAP = 4;

/** Stacked segments take the series colours in order, strongest first. */
const SEGMENT_FILLS = [
  "fill-chart-1",
  "fill-chart-2",
  "fill-chart-3",
  "fill-chart-4",
];

type Diagram = {
  /** Says what the drawing shows; the drawing itself is hidden from readers. */
  caption: string;
} & (
  | { kind: "bars"; values: number[] }
  | { kind: "stack"; values: number[] }
  | { kind: "average"; values: number[] }
);

/**
 * One small drawing per guide, of the rule the guide explains. Every figure
 * is quoted from the guide's own tables and worked examples, so a guide that
 * changes its figures must change them here too.
 */
const DIAGRAMS: Record<string, Diagram> = {
  coe: {
    caption: "A COE lasts 10 years.",
    kind: "bars",
    values: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
  pqp: {
    caption: "The PQP is the 3-month moving average of COE premiums.",
    kind: "average",
    values: [95_000, 98_000, 97_000, 100_000, 99_000, 96_000],
  },
  parf: {
    caption:
      "PARF rebate for COEs from February 2026: 30% of ARF, falling to 5% in the 10th year.",
    kind: "bars",
    values: [30, 30, 30, 30, 30, 25, 20, 15, 10, 5],
  },
  "check-parf-rebate": {
    caption:
      "Worked example: $26,000 PARF rebate plus $37,500 COE rebate is $63,500.",
    kind: "stack",
    values: [26_000, 37_500],
  },
  arf: {
    caption: "ARF rates by OMV band: 100%, 140%, 190%, 250% and 320%.",
    kind: "bars",
    values: [100, 140, 190, 250, 320],
  },
  omv: {
    caption:
      "Worked example: a $30,000 OMV is $73,240 after ARF, excise duty and GST.",
    kind: "stack",
    values: [30_000, 34_000, 6_000, 3_240],
  },
};

/** Each mark draws in once, when its card scrolls into view. */
const drawIn = {
  initial: "hidden",
  viewport: { once: true },
  whileInView: "visible",
} as const;

function Bars({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const barWidth = (WIDTH - GAP * (values.length - 1)) / values.length;

  return values.map((value, index) => {
    const barHeight = (value / max) * HEIGHT;

    return (
      <motion.rect
        className="fill-accent"
        height={barHeight}
        custom={index}
        // biome-ignore lint/suspicious/noArrayIndexKey: values may repeat
        key={index}
        rx={2}
        style={{ originY: 1 }}
        variants={growUpVariants}
        width={barWidth}
        x={index * (barWidth + GAP)}
        y={HEIGHT - barHeight}
        {...drawIn}
      />
    );
  });
}

function Stack({ values }: { values: number[] }) {
  const total = values.reduce((sum, value) => sum + value, 0);
  const usable = WIDTH - GAP * (values.length - 1);
  let offset = 0;

  return values.map((value, index) => {
    const segmentWidth = (value / total) * usable;
    const x = offset;
    offset += segmentWidth + GAP;

    return (
      <motion.rect
        className={SEGMENT_FILLS[index % SEGMENT_FILLS.length]}
        height={16}
        custom={index * 3}
        // biome-ignore lint/suspicious/noArrayIndexKey: values may repeat
        key={index}
        rx={2}
        style={{ originX: 0 }}
        variants={growAcrossVariants}
        width={segmentWidth}
        x={x}
        y={16}
        {...drawIn}
      />
    );
  });
}

/** The results as dots, and their average as a line across them. */
function Average({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  // Dots sit inside the drawing, 8 units clear of its top and bottom.
  const toY = (value: number) =>
    HEIGHT - 8 - ((value - min) / (max - min)) * (HEIGHT - 16);
  const step = (WIDTH - 16) / (values.length - 1);

  return (
    <>
      {values.map((value, index) => (
        <motion.circle
          className="fill-chart-4"
          cx={8 + index * step}
          cy={toY(value)}
          custom={index}
          // biome-ignore lint/suspicious/noArrayIndexKey: values may repeat
          key={index}
          r={4}
          variants={fadeInVariants}
          {...drawIn}
        />
      ))}
      <motion.line
        className="stroke-chart-1"
        custom={values.length}
        strokeLinecap="round"
        strokeWidth={2}
        style={{ originX: 0 }}
        variants={growAcrossVariants}
        x1={0}
        x2={WIDTH}
        y1={toY(average)}
        y2={toY(average)}
        {...drawIn}
      />
    </>
  );
}

/**
 * The drawing on a guide's card. It draws itself in once when it scrolls into
 * view, and stays still for readers who have asked for reduced motion. A
 * guide with no drawing renders nothing.
 */
export function GuideDiagram({ slug }: { slug: string }) {
  const diagram = DIAGRAMS[slug];

  if (!diagram) {
    return null;
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-2 border-separator border-b pb-4">
        <svg
          aria-hidden="true"
          className="h-12 w-60 max-w-full"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        >
          {diagram.kind === "bars" ? <Bars values={diagram.values} /> : null}
          {diagram.kind === "stack" ? <Stack values={diagram.values} /> : null}
          {diagram.kind === "average" ? (
            <Average values={diagram.values} />
          ) : null}
        </svg>
        <Typography.Paragraph color="muted" size="xs">
          {diagram.caption}
        </Typography.Paragraph>
      </div>
    </MotionConfig>
  );
}
