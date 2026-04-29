import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { formatCurrency, formatDateToMonthYear } from "@motormetrics/utils";
import Typography from "@web/components/typography";
import type { PremiumRangeStats } from "@web/lib/coe/calculations";

interface PremiumRangeCardProps {
  stats: PremiumRangeStats[];
}

interface RangeBarProps {
  lowest: number;
  highest: number;
  globalMin: number;
  globalMax: number;
}

const RangeBar = ({ lowest, highest, globalMin, globalMax }: RangeBarProps) => {
  const range = globalMax - globalMin;
  const leftPercent = range > 0 ? ((lowest - globalMin) / range) * 100 : 0;
  const widthPercent = range > 0 ? ((highest - lowest) / range) * 100 : 100;

  return (
    <div className="relative h-2 w-full rounded-full bg-default-100">
      <div
        className="absolute h-full rounded-full bg-primary/30 transition-all duration-500 ease-out"
        style={{
          left: `${leftPercent}%`,
          width: `${Math.max(widthPercent, 2)}%`,
        }}
      />
      {/* Low marker */}
      <div
        className="absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-full bg-primary"
        style={{ left: `${leftPercent}%` }}
        title={`Low: ${formatCurrency(lowest)}`}
      />
      {/* High marker */}
      <div
        className="absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-full bg-primary"
        style={{ left: `${leftPercent + widthPercent}%` }}
        title={`High: ${formatCurrency(highest)}`}
      />
    </div>
  );
};

interface RangeSectionProps {
  label: string;
  highest: number;
  lowest: number;
  highestDate?: string;
  lowestDate?: string;
  globalMin: number;
  globalMax: number;
}

const RangeSection = ({
  label,
  highest,
  lowest,
  highestDate,
  lowestDate,
  globalMin,
  globalMax,
}: RangeSectionProps) => {
  const spread = highest - lowest;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Chip size="sm" variant="flat" className="rounded-full font-medium">
          {label}
        </Chip>
        <span className="text-default-400 text-xs">
          Spread: {formatCurrency(spread)}
        </span>
      </div>

      <RangeBar
        lowest={lowest}
        highest={highest}
        globalMin={globalMin}
        globalMax={globalMax}
      />

      <div className="grid grid-cols-2 gap-4">
        {/* Low value */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-default-500 text-xs uppercase tracking-wider">
              Low
            </span>
          </div>
          <span className="font-semibold text-lg text-primary tabular-nums">
            {formatCurrency(lowest)}
          </span>
          {lowestDate && (
            <Typography.Caption>
              {formatDateToMonthYear(lowestDate)}
            </Typography.Caption>
          )}
        </div>

        {/* High value */}
        <div className="flex flex-col gap-1 text-right">
          <div className="flex items-center justify-end gap-2">
            <span className="text-default-500 text-xs uppercase tracking-wider">
              High
            </span>
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
          <span className="font-semibold text-lg text-primary tabular-nums">
            {formatCurrency(highest)}
          </span>
          {highestDate && (
            <Typography.Caption>
              {formatDateToMonthYear(highestDate)}
            </Typography.Caption>
          )}
        </div>
      </div>
    </div>
  );
};

export function PremiumRangeCard({ stats }: PremiumRangeCardProps) {
  // Calculate global min/max for consistent range bar scaling
  const allPremiums = stats.flatMap((s) => [
    s.allTime.lowest,
    s.allTime.highest,
    ...(s.ytd ? [s.ytd.lowest, s.ytd.highest] : []),
  ]);
  const globalMin = Math.min(...allPremiums);
  const globalMax = Math.max(...allPremiums);

  // Derive current year from YTD data or all-time data to avoid new Date() in prerender
  const firstWithYtd = stats.find((s) => s.ytd?.highestDate);
  const currentYear = firstWithYtd?.ytd?.highestDate
    ? Number.parseInt(firstWithYtd.ytd.highestDate.slice(0, 4), 10)
    : Number.parseInt(stats[0]?.allTime.highestDate?.slice(0, 4) ?? "2025", 10);

  return (
    <>
      {stats.map((stat) => {
        return (
          <Card
            key={stat.category}
            className="group relative overflow-hidden rounded-2xl p-3 transition-shadow duration-300 hover:shadow-lg"
          >
            {/* Accent bar at top */}
            <div className="absolute top-0 right-0 left-0 h-1 bg-primary" />

            <CardHeader className="flex flex-col items-start gap-1 pt-4">
              <Typography.H4>{stat.category}</Typography.H4>
              <Typography.Caption>Premium range analysis</Typography.Caption>
            </CardHeader>

            <CardBody className="flex flex-col gap-6 pt-0">
              {/* YTD Range */}
              {stat.ytd ? (
                <RangeSection
                  label={`${currentYear} YTD`}
                  highest={stat.ytd.highest}
                  lowest={stat.ytd.lowest}
                  highestDate={stat.ytd.highestDate}
                  lowestDate={stat.ytd.lowestDate}
                  globalMin={globalMin}
                  globalMax={globalMax}
                />
              ) : (
                <div className="flex flex-col gap-2">
                  <Chip
                    size="sm"
                    variant="flat"
                    className="rounded-full font-medium"
                  >
                    {currentYear} YTD
                  </Chip>
                  <Typography.TextSm className="text-default-400">
                    No data available for {currentYear}
                  </Typography.TextSm>
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-divider" />

              {/* All-time Range */}
              <RangeSection
                label="All-time"
                highest={stat.allTime.highest}
                lowest={stat.allTime.lowest}
                highestDate={stat.allTime.highestDate}
                lowestDate={stat.allTime.lowestDate}
                globalMin={globalMin}
                globalMax={globalMax}
              />
            </CardBody>
          </Card>
        );
      })}
    </>
  );
}
