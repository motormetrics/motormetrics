"use client";

import { Typography } from "@heroui/react";
import { LegendItem } from "@web/components/shared/legend-item";
import { growUpVariants } from "@web/config/animations";
import type { PostTrend as Trend } from "@web/queries/posts/trends";
import { MotionConfig } from "motion/react";
import * as motion from "motion/react-client";

const WIDTH = 240;
const HEIGHT = 48;
const GAP = 4;

/** Each series' fill: the latest month, then the months before it. */
const FILLS = [
  ["fill-accent", "fill-accent/40"],
  ["fill-chart-1", "fill-chart-1/40"],
];

/**
 * The chart on a post's card: one bar a month, the month the post reports on
 * last and in full colour. A trend with a second series draws the two side
 * by side each month, with a legend. It draws itself in once when it scrolls
 * into view, and stays still for readers who have asked for reduced motion.
 */
export function PostTrend({ trend }: { trend: Trend }) {
  const { caption, second, values } = trend;
  const series = second ? [values, second.values] : [values];
  const max = Math.max(...series.flat());
  const groupWidth = (WIDTH - GAP * (values.length - 1)) / values.length;
  const barWidth = (groupWidth - (series.length - 1)) / series.length;

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-2 border-separator border-b pb-4">
        <svg
          aria-hidden="true"
          className="h-12 w-60 max-w-full"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        >
          {series.map((points, seriesIndex) =>
            points.map((value, index) => {
              const barHeight = max > 0 ? (value / max) * HEIGHT : 0;
              const isLatest = index === points.length - 1;

              return (
                <motion.rect
                  className={FILLS[seriesIndex][isLatest ? 0 : 1]}
                  height={barHeight}
                  custom={index}
                  initial="hidden"
                  // biome-ignore lint/suspicious/noArrayIndexKey: values may repeat
                  key={`${seriesIndex}-${index}`}
                  rx={2}
                  style={{ originY: 1 }}
                  variants={growUpVariants}
                  viewport={{ once: true }}
                  whileInView="visible"
                  width={barWidth}
                  x={index * (groupWidth + GAP) + seriesIndex * (barWidth + 1)}
                  y={HEIGHT - barHeight}
                />
              );
            }),
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
