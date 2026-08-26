import { Tooltip } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { NumberValue } from "@heroui-pro/react";
import { HeroCard } from "@web/components/shared/bento";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { sparkline } from "@web/components/shared/sparkline";
import Typography from "@web/components/typography";
import {
  getMonthlyRegistrationTotals,
  getYearlyRegistrations,
} from "@web/queries/cars";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const formatMonth = (month: string, style: "long" | "short" = "long") => {
  const [year, monthPart] = month.split("-");
  return new Date(Number(year), Number(monthPart) - 1).toLocaleString("en-SG", {
    month: style,
    year: "numeric",
  });
};

export async function SummaryCard() {
  const [monthly, yearlyData] = await Promise.all([
    getMonthlyRegistrationTotals(12),
    getYearlyRegistrations(),
  ]);

  const current = monthly.at(-1);
  const previous = monthly.at(-2);

  if (!current) {
    return null;
  }

  const previousTotal = previous?.total ?? 0;
  // Month-over-month, not year-over-year: comparing a part-complete year against
  // a full one produced a headline that read as a ~75% collapse.
  const changeRatio =
    previousTotal > 0 ? (current.total - previousTotal) / previousTotal : 0;

  const yearToDate = yearlyData.at(-1);
  const spark = sparkline(
    monthly.map((item) => item.total),
    380,
    90,
  );

  return (
    <HeroCard>
      <span className="w-fit rounded-full bg-accent-foreground/20 px-4 py-2 font-bold text-sm">
        New registrations · {formatMonth(current.month)}
      </span>

      <div className="flex flex-wrap items-center gap-4">
        <span className="font-extrabold text-6xl tabular-nums tracking-[-0.03em]">
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={current.total}
          />
        </span>
        <DeltaChip ratio={changeRatio} tone="inverse" />
      </div>

      <Typography.TextSm className="font-semibold text-accent-foreground/85">
        cars registered vs{" "}
        {previous ? formatMonth(previous.month, "short") : "previous month"}
      </Typography.TextSm>

      {spark ? (
        <svg
          className="h-[90px] w-full overflow-visible"
          role="img"
          viewBox="0 0 380 90"
        >
          <title>{`Monthly registrations over the last ${monthly.length} months`}</title>
          <path d={spark.area} fill="currentColor" opacity={0.16} />
          <path
            d={spark.line}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3.5}
          />
          <circle
            cx={spark.lastX}
            cy={spark.lastY}
            fill="var(--accent)"
            r={6}
            stroke="currentColor"
            strokeWidth={3.5}
          />
        </svg>
      ) : null}

      <div className="flex items-center gap-4 rounded-field bg-foreground/45 px-6 py-5">
        <div className="flex flex-col gap-1">
          <Typography.TextSm className="font-bold text-accent-foreground text-lg">
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={yearToDate?.total ?? 0}
            />{" "}
            year to date
          </Typography.TextSm>
          <Typography.Caption className="text-accent-foreground/70">
            cars registered in {yearToDate?.year ?? "—"}
          </Typography.Caption>
        </div>
        <Tooltip delay={300}>
          <Link
            aria-label="View car registration overview"
            className={buttonVariants({
              className:
                "ml-auto size-12 shrink-0 rounded-full bg-accent text-accent-foreground",
              isIconOnly: true,
              variant: "tertiary",
            })}
            href="/cars"
          >
            <ArrowUpRight className="size-5" />
          </Link>
          <Tooltip.Content>View car registration overview</Tooltip.Content>
        </Tooltip>
      </div>
    </HeroCard>
  );
}
