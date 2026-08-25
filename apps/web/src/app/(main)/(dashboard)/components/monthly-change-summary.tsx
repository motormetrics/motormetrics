import { Link, Tooltip } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { NumberValue } from "@heroui-pro/react";
import Typography from "@web/components/typography";
import { getCarsComparison, getCarsLatestMonth } from "@web/queries/cars";
import { ArrowUpRight, CalendarDays } from "lucide-react";

export async function MonthlyChangeSummary() {
  const latestMonth = await getCarsLatestMonth();

  if (!latestMonth) {
    return null;
  }

  const comparison = await getCarsComparison(latestMonth);
  const currentTotal = comparison.currentMonth.total;
  const previousTotal = comparison.previousMonth.total;

  const changeAmount = currentTotal - previousTotal;
  const changeRatio = previousTotal > 0 ? changeAmount / previousTotal : 0;

  const [year, month] = latestMonth.split("-");
  const displayMonth = new Date(Number(year), Number(month) - 1).toLocaleString(
    "en-SG",
    { month: "long", year: "numeric" },
  );

  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius)] bg-[var(--ink-surface)] p-7">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-on-dark)]/20 text-[var(--accent-on-dark)]">
          <CalendarDays className="size-5" />
        </span>
        <Typography.TextSm className="font-semibold text-[var(--accent-foreground)]/85">
          Monthly change
        </Typography.TextSm>
        <Tooltip delay={300}>
          <Link
            aria-label="View monthly car registration details"
            className={buttonVariants({
              className:
                "ml-auto size-10 rounded-full text-[var(--accent-foreground)]",
              isIconOnly: true,
              variant: "tertiary",
            })}
            href={`/cars?month=${latestMonth}`}
          >
            <ArrowUpRight className="size-5" />
          </Link>
          <Tooltip.Content>
            View monthly car registration details
          </Tooltip.Content>
        </Tooltip>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="font-extrabold text-5xl text-[var(--accent-on-dark)] tabular-nums tracking-[-0.03em]">
          <NumberValue
            maximumFractionDigits={1}
            signDisplay="exceptZero"
            style="percent"
            value={changeRatio}
          />
        </span>
        <span className="flex items-center gap-2 rounded-full bg-[var(--accent-on-dark)]/20 px-4 py-2 font-bold text-[var(--accent-on-dark)] text-sm">
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            signDisplay="exceptZero"
            value={changeAmount}
          />
        </span>
      </div>

      <Typography.TextSm className="font-semibold text-[var(--accent-foreground)]/60">
        registrations vs previous month · {displayMonth}
      </Typography.TextSm>
    </div>
  );
}
