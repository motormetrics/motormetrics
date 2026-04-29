import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  formatCurrency,
  formatDateToMonthYear,
  formatOrdinal,
} from "@motormetrics/utils";
import { AnimatedNumber } from "@web/components/animated-number";
import Typography from "@web/components/typography";
import type { COEResult } from "@web/types";
import { ArrowDownIcon, ArrowUpIcon, ClockIcon } from "lucide-react";

interface BiddingRoundCardsProps {
  month: string;
  firstRound: COEResult[];
  secondRound: COEResult[];
}

const PRIMARY_CATEGORIES = ["Category A", "Category B"];
const SECONDARY_CATEGORIES = ["Category C", "Category D", "Category E"];

const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

interface CategoryRowProps {
  category: string;
  premium: number;
  previousPremium?: number;
  isPrimary?: boolean;
  showChange?: boolean;
}

const CategoryRow = ({
  category,
  premium,
  previousPremium,
  isPrimary = false,
  showChange = false,
}: CategoryRowProps) => {
  const change =
    showChange && previousPremium
      ? calculateChange(premium, previousPremium)
      : null;

  return (
    <div
      className={`flex items-center justify-between ${isPrimary ? "py-3" : "py-2"}`}
    >
      <div className="flex items-center gap-2">
        <div className="h-6 w-2 rounded-full bg-primary" />
        <span
          className={`font-medium ${isPrimary ? "text-foreground" : "text-default-600 text-sm"}`}
        >
          {category}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`font-semibold text-primary tabular-nums ${isPrimary ? "text-lg" : "text-sm"}`}
        >
          {isPrimary ? (
            <AnimatedNumber value={premium} format="currency" />
          ) : (
            formatCurrency(premium)
          )}
        </span>
        {change !== null && change !== 0 && (
          <Chip
            size="sm"
            variant="flat"
            color={change > 0 ? "danger" : "success"}
            startContent={
              change > 0 ? (
                <ArrowUpIcon className="size-3" />
              ) : (
                <ArrowDownIcon className="size-3" />
              )
            }
            classNames={{
              base: "h-6 px-1.5",
              content: "text-xs font-medium tabular-nums",
            }}
          >
            {Math.abs(change).toFixed(1)}%
          </Chip>
        )}
      </div>
    </div>
  );
};

interface RoundCardProps {
  roundNumber: 1 | 2;
  data: COEResult[];
  comparisonData?: COEResult[];
  isPlaceholder?: boolean;
}

const RoundCard = ({
  roundNumber,
  data,
  comparisonData,
  isPlaceholder = false,
}: RoundCardProps) => {
  const getPremiumForCategory = (
    results: COEResult[],
    category: string,
  ): number | undefined => {
    return results.find((r) => r.vehicleClass === category)?.premium;
  };

  if (isPlaceholder) {
    return (
      <Card className="border-2 border-dashed bg-default-50/50 p-3 shadow-none">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Chip size="sm" color="primary">
            {formatOrdinal(roundNumber)} Round
          </Chip>
        </CardHeader>
        <CardBody className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="flex size-12 items-center justify-center rounded-full bg-default-100">
            <ClockIcon className="size-6 text-default-400" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <Typography.TextSm className="font-medium text-default-600">
              Results Pending
            </Typography.TextSm>
            <Typography.Caption>
              2nd round bidding typically occurs mid-month
            </Typography.Caption>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl p-3">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Chip size="sm" color="primary">
          {formatOrdinal(roundNumber)} Round
        </Chip>
      </CardHeader>
      <CardBody className="flex flex-col gap-0 pt-0">
        {/* Primary categories (A & B) */}
        <div className="flex flex-col">
          {PRIMARY_CATEGORIES.map((category) => {
            const premium = getPremiumForCategory(data, category);
            const previousPremium = comparisonData
              ? getPremiumForCategory(comparisonData, category)
              : undefined;

            if (premium === undefined) return null;

            return (
              <CategoryRow
                key={category}
                category={category}
                premium={premium}
                previousPremium={previousPremium}
                isPrimary
                showChange={!!comparisonData}
              />
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-2 h-px bg-divider" />

        {/* Secondary categories (C, D, E) */}
        <div className="flex flex-col">
          {SECONDARY_CATEGORIES.map((category) => {
            const premium = getPremiumForCategory(data, category);
            const previousPremium = comparisonData
              ? getPremiumForCategory(comparisonData, category)
              : undefined;

            if (premium === undefined) return null;

            return (
              <CategoryRow
                key={category}
                category={category}
                premium={premium}
                previousPremium={previousPremium}
                showChange={!!comparisonData}
              />
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};

export function BiddingRoundCards({
  month,
  firstRound,
  secondRound,
}: BiddingRoundCardsProps) {
  const hasSecondRound = secondRound.length > 0;
  const formattedMonth = month ? formatDateToMonthYear(month) : "";

  return (
    <div className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Typography.H3>Bidding Rounds</Typography.H3>
        {formattedMonth && (
          <Chip size="sm" color="primary">
            {formattedMonth}
          </Chip>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <RoundCard roundNumber={1} data={firstRound} />
        {hasSecondRound ? (
          <RoundCard roundNumber={2} data={secondRound} />
        ) : (
          <RoundCard roundNumber={2} data={[]} isPlaceholder />
        )}
      </div>
    </div>
  );
}
