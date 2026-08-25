"use client";

import { TrendChip } from "@heroui-pro/react";
import { ArrowDown, ArrowUp } from "lucide-react";

/**
 * Trend chip for figures where a fall is good news (COE premiums, PQP rates).
 *
 * `trend` drives both the colour and the default arrow in HeroUI Pro, so the
 * sentiment is inverted on `trend` while the arrow is overridden to follow the
 * actual sign — otherwise the chip reads as a contradiction like "↑ -5.3%".
 *
 * This must stay a client component: TrendChip only suppresses its default
 * arrow when it can identify a `TrendChip.Indicator` child, and that identity
 * check fails across the server/client boundary, rendering two arrows.
 */
export function CostTrendChip({ changeRatio }: { changeRatio: number }) {
  if (changeRatio === 0) {
    return null;
  }

  const isUp = changeRatio > 0;
  const Arrow = isUp ? ArrowUp : ArrowDown;

  return (
    <TrendChip trend={isUp ? "down" : "up"} variant="primary">
      <TrendChip.Indicator>
        <Arrow />
      </TrendChip.Indicator>
      {`${isUp ? "+" : ""}${(changeRatio * 100).toFixed(1)}%`}
    </TrendChip>
  );
}
