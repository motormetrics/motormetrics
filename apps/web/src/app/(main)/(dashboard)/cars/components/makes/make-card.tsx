"use client";

import { Chip, Text } from "@heroui/react";
import { KPI, NumberValue, TrendChip } from "@heroui-pro/react";

import { formatGrowthRate, slugify } from "@motormetrics/utils";
import type { Make } from "@web/types";
import Image from "next/image";
import Link from "next/link";

interface MakeCardProps {
  make: Make;
  logoUrl?: string;
  count?: number;
  share?: number;
  trend?: { value: number }[];
  yoyChange?: number | null;
}

export function MakeCard({
  make,
  logoUrl,
  count,
  share,
  trend,
  yoyChange,
}: MakeCardProps) {
  const href = `/cars/makes/${slugify(make)}`;
  const trendDirection = yoyChange
    ? yoyChange > 0
      ? "up"
      : "down"
    : "neutral";

  return (
    <Link href={href} className="block h-full no-underline">
      <KPI className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <KPI.Content>
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <div className="flex size-16 shrink-0 items-center justify-center">
                {logoUrl ? (
                  <Image
                    alt={`${make} logo`}
                    src={logoUrl}
                    width={512}
                    height={512}
                    className="size-full object-contain"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground text-lg">
                    {make.charAt(0) || "?"}
                  </span>
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <Text type="body-sm" weight="medium">
                  {make}
                </Text>
                {!!count && !!share && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline gap-2">
                      <NumberValue
                        className="font-bold text-xl leading-none"
                        locale="en-SG"
                        maximumFractionDigits={0}
                        value={count}
                      />
                      <Text type="body-xs" color="muted">
                        regs
                      </Text>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip
                        color="accent"
                        variant="primary"
                        size="sm"
                        className="rounded-full"
                      >
                        <NumberValue
                          maximumFractionDigits={1}
                          style="percent"
                          value={share / 100}
                        >
                          <NumberValue.Suffix> share</NumberValue.Suffix>
                        </NumberValue>
                      </Chip>
                      {!!yoyChange && (
                        <TrendChip trend={trendDirection} variant="primary">
                          {formatGrowthRate(yoyChange)}
                        </TrendChip>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {trend && trend.length > 0 ? (
              <KPI.Chart
                color="var(--color-accent)"
                data={trend}
                height={40}
                strokeWidth={2}
              />
            ) : null}
          </div>
        </KPI.Content>
      </KPI>
    </Link>
  );
}
