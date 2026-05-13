import { Card, Chip, Text } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatCurrency, formatDateToMonthYear } from "@motormetrics/utils";
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
    <div className="relative h-2 w-full rounded-full bg-default">
      <div
        className="absolute h-full rounded-full bg-accent/30 transition-all duration-500 ease-out"
        style={{
          left: `${leftPercent}%`,
          width: `${Math.max(widthPercent, 2)}%`,
        }}
      />
      {/* Low marker */}
      <div
        className="absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-full bg-accent"
        style={{ left: `${leftPercent}%` }}
        title={`Low: ${formatCurrency(lowest)}`}
      />
      {/* High marker */}
      <div
        className="absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-full bg-accent"
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
        <Chip size="sm" variant="primary" className="font-medium">
          {label}
        </Chip>
        <span className="text-muted text-xs">
          Spread:{" "}
          <NumberValue
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={spread}
          />
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
            <div className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-muted text-xs uppercase tracking-wider">
              Low
            </span>
          </div>
          <NumberValue
            className="font-semibold text-accent text-lg"
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={lowest}
          />
          {lowestDate && (
            <Text type="body-xs" color="muted">
              {formatDateToMonthYear(lowestDate)}
            </Text>
          )}
        </div>

        {/* High value */}
        <div className="flex flex-col gap-1 text-right">
          <div className="flex items-center justify-end gap-2">
            <span className="text-muted text-xs uppercase tracking-wider">
              High
            </span>
            <div className="h-2 w-2 rounded-full bg-accent" />
          </div>
          <NumberValue
            className="font-semibold text-accent text-lg"
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={highest}
          />
          {highestDate && (
            <Text type="body-xs" color="muted">
              {formatDateToMonthYear(highestDate)}
            </Text>
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
            className="group relative overflow-hidden transition-shadow duration-300 hover:shadow-lg"
          >
            {/* Accent bar at top */}
            <div className="absolute top-0 right-0 left-0 h-1 bg-accent" />

            <Card.Header className="flex flex-col items-start gap-1">
              <Text type="h4">{stat.category}</Text>
              <Text type="body-xs" color="muted">
                Premium range analysis
              </Text>
            </Card.Header>

            <Card.Content className="flex flex-col gap-6">
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
                    variant="primary"
                    className="rounded-full font-medium"
                  >
                    {currentYear} YTD
                  </Chip>
                  <Text type="body-sm" color="muted">
                    No data available for {currentYear}
                  </Text>
                </div>
              )}

              {/* Separator */}
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
            </Card.Content>
          </Card>
        );
      })}
    </>
  );
}
