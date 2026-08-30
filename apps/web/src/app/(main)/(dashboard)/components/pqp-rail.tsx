import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { getPqpRates } from "@web/queries/coe";
import { CostTrendChip } from "./cost-trend-chip";

const CATEGORY_NAMES: Record<string, string> = {
  "Category A": "Cars up to 1600cc & 130bhp",
  "Category B": "Cars above 1600cc or 130bhp",
  "Category C": "Goods vehicles & buses",
  "Category D": "Motorcycles",
};

const formatMonth = (month: string) => {
  const [year, monthPart] = month.split("-");
  return new Date(Number(year), Number(monthPart) - 1).toLocaleString("en-SG", {
    month: "long",
    year: "numeric",
  });
};

export async function PqpRail() {
  const rates = await getPqpRates();
  const months = Object.keys(rates).sort().reverse();
  const [latestMonth, previousMonth] = months;

  if (!latestMonth) {
    return null;
  }

  const latest = rates[latestMonth];
  const previous = previousMonth ? rates[previousMonth] : undefined;

  const rows = Object.entries(latest ?? {}).map(([category, value]) => {
    const previousValue = previous?.[category as keyof typeof previous];
    const changeRatio =
      previousValue && previousValue > 0
        ? (value - previousValue) / previousValue
        : 0;
    return {
      category,
      changeRatio,
      letter: category.replace("Category ", ""),
      name: CATEGORY_NAMES[category] ?? category,
      value,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Typography.Paragraph color="muted" size="sm">
          PQP premiums · for COE renewals
        </Typography.Paragraph>
        <Typography.Heading level={3}>
          {formatMonth(latestMonth)} rates
        </Typography.Heading>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div
            className="flex items-center gap-3 rounded-field bg-surface p-4"
            key={row.category}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/15 font-extrabold text-accent-strong text-lg">
              {row.letter}
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-bold tabular-nums">
                <NumberValue
                  currency="SGD"
                  locale="en-SG"
                  maximumFractionDigits={0}
                  style="currency"
                  value={row.value}
                />
              </span>
              <Typography.Paragraph
                color="muted"
                size="xs"
                className="truncate"
              >
                {row.name}
              </Typography.Paragraph>
            </div>
            <div className="ml-auto shrink-0">
              <CostTrendChip changeRatio={row.changeRatio} />
            </div>
          </div>
        ))}
      </div>

      <Typography.Paragraph color="muted" size="xs">
        3-month moving average of premiums · renew 5 or 10 years
      </Typography.Paragraph>
    </div>
  );
}
