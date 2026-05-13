import { Card, Chip, Text } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import type { SelectCarCost } from "@motormetrics/database";
import { formatCurrency } from "@motormetrics/utils";
import {
  FUEL_TYPE_LABELS,
  FUEL_TYPE_ORDER,
} from "@web/app/(main)/(dashboard)/cars/costs/constants";

interface CostRangeCardProps {
  data: SelectCarCost[];
}

interface RangeBarProps {
  lowest: number;
  highest: number;
  globalMin: number;
  globalMax: number;
}

function RangeBar({ lowest, highest, globalMin, globalMax }: RangeBarProps) {
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
}

interface RangeSectionProps {
  lowestModel: string;
  lowestPrice: number;
  highestModel: string;
  highestPrice: number;
  globalMin: number;
  globalMax: number;
}

function RangeSection({
  lowestModel,
  lowestPrice,
  highestModel,
  highestPrice,
  globalMin,
  globalMax,
}: RangeSectionProps) {
  const spread = highestPrice - lowestPrice;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Chip size="sm" variant="primary" className="font-medium">
          Price Range
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
        lowest={lowestPrice}
        highest={highestPrice}
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
            value={lowestPrice}
          />
          <Text type="body-xs" color="muted">
            {lowestModel}
          </Text>
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
            value={highestPrice}
          />
          <Text type="body-xs" color="muted">
            {highestModel}
          </Text>
        </div>
      </div>
    </div>
  );
}

interface FuelTypeGroup {
  fuelType: string;
  lowestModel: string;
  lowestPrice: number;
  highestModel: string;
  highestPrice: number;
}

export function CostRangeCard({ data }: CostRangeCardProps) {
  const quoted = data.filter((item) => item.sellingPriceWithCoe > 0);

  // Group by fuel type
  const groupMap = new Map<string, SelectCarCost[]>();
  for (const item of quoted) {
    const existing = groupMap.get(item.fuelType) ?? [];
    existing.push(item);
    groupMap.set(item.fuelType, existing);
  }

  // Build fuel type groups with lowest/highest
  const groups: FuelTypeGroup[] = [];
  for (const fuelType of FUEL_TYPE_ORDER) {
    const items = groupMap.get(fuelType);
    if (!items || items.length === 0) continue;

    const sorted = items.toSorted(
      (a, b) => a.sellingPriceWithCoe - b.sellingPriceWithCoe,
    );
    const lowest = sorted[0];
    const highest = sorted[sorted.length - 1];

    groups.push({
      fuelType,
      lowestModel: `${lowest.make} ${lowest.model}`,
      lowestPrice: lowest.sellingPriceWithCoe,
      highestModel: `${highest.make} ${highest.model}`,
      highestPrice: highest.sellingPriceWithCoe,
    });
  }

  if (groups.length === 0) return null;

  // Global min/max for consistent range bar scaling
  const globalMin = Math.min(...groups.map((g) => g.lowestPrice));
  const globalMax = Math.max(...groups.map((g) => g.highestPrice));

  return (
    <>
      {groups.map((group) => (
        <Card
          key={group.fuelType}
          className="group relative overflow-hidden transition-shadow duration-300 hover:shadow-lg"
        >
          {/* Accent bar at top */}
          <div className="absolute top-0 right-0 left-0 h-1 bg-accent" />

          <Card.Header className="flex flex-col items-start gap-1">
            <Text type="h4">
              {FUEL_TYPE_LABELS[group.fuelType] ?? group.fuelType}
            </Text>
            <Text type="body-xs" color="muted">
              Selling price range (w/ COE)
            </Text>
          </Card.Header>

          <Card.Content className="flex flex-col gap-6">
            <RangeSection
              lowestModel={group.lowestModel}
              lowestPrice={group.lowestPrice}
              highestModel={group.highestModel}
              highestPrice={group.highestPrice}
              globalMin={globalMin}
              globalMax={globalMax}
            />
          </Card.Content>
        </Card>
      ))}
    </>
  );
}
