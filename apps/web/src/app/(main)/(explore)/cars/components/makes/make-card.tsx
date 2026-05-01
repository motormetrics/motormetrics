"use client";

import { Card, Chip } from "@heroui/react";

import {
  formatGrowthRate,
  formatPercentage,
  slugify,
} from "@motormetrics/utils";
import { Sparkline } from "@web/components/charts/sparkline";
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
                        variant="soft"
                        size="sm"
                        className="rounded-full"
                      >
                        {formatPercentage(share)} share
                      </Chip>
                      {!!yoyChange && (
                        <Chip
                          color={yoyChange >= 0 ? "success" : "danger"}
                          variant="soft"
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
              <Sparkline data={trend} height="h-10" />
            )}
          </div>
        </Card.Content>
      </Card>
    </Link>
  );
}
