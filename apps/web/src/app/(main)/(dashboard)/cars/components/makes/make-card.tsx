"use client";

import { Card, Chip } from "@heroui/react";
import { AreaChart } from "@heroui-pro/react";

import {
  formatGrowthRate,
  formatPercentage,
  slugify,
} from "@motormetrics/utils";
import Typography from "@web/components/typography";
import type { Make } from "@web/types";
import { TrendingDown, TrendingUp } from "lucide-react";
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
  const gradientId = `make-${slugify(make)}-sparkline`;

  return (
    <Link href={href} className="block h-full no-underline">
      <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <Card.Content>
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
                <Typography.Label className="truncate">{make}</Typography.Label>
                {!!count && !!share && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-xl tabular-nums leading-none">
                        {count.toLocaleString()}
                      </span>
                      <Typography.Caption>regs</Typography.Caption>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip
                        color="accent"
                        variant="primary"
                        size="sm"
                        className="rounded-full"
                      >
                        {formatPercentage(share)} share
                      </Chip>
                      {!!yoyChange && (
                        <Chip
                          color={yoyChange >= 0 ? "success" : "danger"}
                          variant="primary"
                          size="sm"
                        >
                          {yoyChange >= 0 ? (
                            <TrendingUp className="size-3" />
                          ) : (
                            <TrendingDown className="size-3" />
                          )}
                          {formatGrowthRate(yoyChange)}
                        </Chip>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {trend && trend.length > 0 && (
              <div className="h-10 w-full">
                <AreaChart
                  data={trend}
                  height={40}
                  margin={{ bottom: 0, left: 0, right: 0, top: 2 }}
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--accent)"
                        stopOpacity={0.1}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--accent)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <AreaChart.Area
                    dataKey="value"
                    dot={false}
                    fill={`url(#${gradientId})`}
                    stroke="var(--accent)"
                    strokeWidth={2}
                    type="monotone"
                  />
                </AreaChart>
              </div>
            )}
          </div>
        </Card.Content>
      </Card>
    </Link>
  );
}
