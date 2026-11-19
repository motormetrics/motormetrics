"use client";

import { Typography } from "@heroui/react";
import { growUpVariants } from "@web/config/animations";
import type { PostTrend as Trend } from "@web/queries/posts/trends";
import { MotionConfig } from "motion/react";
import * as motion from "motion/react-client";

const WIDTH = 240;
const HEIGHT = 48;
const GAP = 4;

/**
 * The chart on a post's card: one bar a month, the month the post reports on
 * last and in full colour. It draws itself in once when it scrolls into view,
 * and stays still for readers who have asked for reduced motion.
 */
export function PostTrend({ trend }: { trend: Trend }) {
  const { caption, values } = trend;
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
          {values.map((value, index) => {
            const barHeight = max > 0 ? (value / max) * HEIGHT : 0;

            return (
              <motion.rect
                className={
                  index === values.length - 1 ? "fill-accent" : "fill-accent/40"
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
          })}
        </svg>
        <Typography.Paragraph color="muted" size="xs">
          {caption}
        </Typography.Paragraph>
      </div>
    </MotionConfig>
  );
}
