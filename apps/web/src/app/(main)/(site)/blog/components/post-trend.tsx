"use client";

import { Typography } from "@heroui/react";
import { LegendItem } from "@web/components/shared/legend-item";
import { fadeInVariants, growUpVariants } from "@web/config/animations";
import type { PostTrend as Trend } from "@web/queries/posts/trends";
import { MotionConfig } from "motion/react";
import * as motion from "motion/react-client";

const WIDTH = 240;
const HEIGHT = 48;
const GAP = 4;

/** The two lines' colours, first series then second. */
const STROKES = ["stroke-accent", "stroke-chart-1"];
const DOTS = ["fill-accent", "fill-chart-1"];

/** Room for the end dots inside the drawing. */
const PAD = 4;

/**
 * Two series on the same months as two lines, each ending on a dot at the
 * month the post reports on. The scale spans the data, not zero: the two
 * series sit close together, and bars from zero would hide the difference.
 */
function TrendLines({ series }: { series: number[][] }) {
  const all = series.flat();
  const min = Math.min(...all);
  const span = Math.max(...all) - min || 1;
  const step = (WIDTH - PAD * 2) / (series[0].length - 1);
  const toPoint = (value: number, index: number) => ({
    x: PAD + index * step,
    y: HEIGHT - PAD - ((value - min) / span) * (HEIGHT - PAD * 2),
  });

  return series.map((values, seriesIndex) => {
    const points = values.map(toPoint);
    const last = points[points.length - 1];

    return (
      // biome-ignore lint/suspicious/noArrayIndexKey: the series are fixed
      <g key={seriesIndex}>
        <motion.polyline
          className={STROKES[seriesIndex]}
          custom={seriesIndex}
          fill="none"
          initial="hidden"
          points={points.map(({ x, y }) => `${x},${y}`).join(" ")}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          variants={fadeInVariants}
          viewport={{ once: true }}
          whileInView="visible"
        />
        <motion.circle
          className={DOTS[seriesIndex]}
          custom={seriesIndex + 2}
          cx={last.x}
          cy={last.y}
          initial="hidden"
          r={3}
          variants={fadeInVariants}
          viewport={{ once: true }}
          whileInView="visible"
        />
      </g>
    );
  });
}

/**
 * The chart on a post's card: one bar a month, the month the post reports on
 * last and in full colour. A trend with a second series draws the two as
 * lines, with a legend. It draws itself in once when it scrolls into view,
 * and stays still for readers who have asked for reduced motion.
 */
export function PostTrend({ trend }: { trend: Trend }) {
  const { caption, second, values } = trend;
  const max = Math.max(...values);
  const barWidth = (WIDTH - GAP * (values.length - 1)) / values.length;

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-2 border-separator border-b pb-4">
        <svg
          aria-hidden="true"
          className="h-12 w-60 max-w-full"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        >
          {second ? (
            <TrendLines series={[values, second.values]} />
          ) : (
            values.map((value, index) => {
              const barHeight = max > 0 ? (value / max) * HEIGHT : 0;

              return (
                <motion.rect
                  className={
                    index === values.length - 1
                      ? "fill-accent"
                      : "fill-accent/40"
                  }
                  height={barHeight}
                  custom={index}
                  initial="hidden"
                  // biome-ignore lint/suspicious/noArrayIndexKey: values may repeat
                  key={index}
                  rx={2}
                  style={{ originY: 1 }}
                  variants={growUpVariants}
                  viewport={{ once: true }}
                  whileInView="visible"
                  width={barWidth}
                  x={index * (barWidth + GAP)}
                  y={HEIGHT - barHeight}
                />
              );
            })
          )}
        </svg>
        {second ? (
          <div className="flex gap-4">
            <LegendItem className="bg-accent" label={second.labels[0]} />
            <LegendItem className="bg-chart-1" label={second.labels[1]} />
          </div>
        ) : null}
        <Typography.Paragraph color="muted" size="xs">
          {caption}
        </Typography.Paragraph>
      </div>
    </MotionConfig>
  );
}
